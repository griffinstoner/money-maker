import type { GameAction, GameResponse, LatLng, Nearby, PlayerView, TamedCreature } from '@game';
import { distanceMeters, offsetMeters } from '@game';
import * as Location from 'expo-location';
import { type ReactNode, createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import { type Account, BackendError, backend } from '@/backend';

export type GpsStatus = 'pending' | 'ok' | 'denied' | 'simulated';

export interface Toast {
  id: number;
  message: string;
  kind: 'info' | 'success' | 'error';
}

interface GameContextValue {
  mode: 'online' | 'offline';
  /** undefined while the stored session loads */
  account: Account | null | undefined;
  player: PlayerView | null;
  nearby: Nearby | null;
  gps: GpsStatus;
  /** Raw device position, for drawing. The server's accepted position is player.location. */
  position: LatLng | null;
  /** Server clock, for countdowns and the stealth rhythm. */
  serverNow: () => number;
  act: (action: GameAction) => Promise<GameResponse | null>;
  creatures: TamedCreature[];
  refreshCreatures: () => Promise<void>;
  toast: Toast | null;
  showToast: (message: string, kind?: Toast['kind']) => void;
  /** Walk the simulated position (dev / no GPS). */
  simulateStep: (northM: number, eastM: number) => void;
}

const GameContext = createContext<GameContextValue | null>(null);

// Where the simulated walker starts: a park, so there's plenty to find.
const SIM_START: LatLng = { lat: 40.7812, lng: -73.9665 };
const SYNC_MIN_INTERVAL_MS = 3000;
const SYNC_MIN_MOVE_M = 8;
const SYNC_HEARTBEAT_MS = 20_000;

export function GameProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<Account | null | undefined>(undefined);
  const [player, setPlayer] = useState<PlayerView | null>(null);
  const [nearby, setNearby] = useState<Nearby | null>(null);
  const [gps, setGps] = useState<GpsStatus>('pending');
  const [position, setPosition] = useState<LatLng | null>(null);
  const [creatures, setCreatures] = useState<TamedCreature[]>([]);
  const [toast, setToast] = useState<Toast | null>(null);
  const clockOffset = useRef(0);
  const accuracyRef = useRef<number | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((message: string, kind: Toast['kind'] = 'info') => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ id: Date.now(), message, kind });
    toastTimer.current = setTimeout(() => setToast(null), 2800);
  }, []);

  const serverNow = useCallback(() => Date.now() + clockOffset.current, []);

  const refreshCreatures = useCallback(async () => {
    try {
      setCreatures(await backend.listCreatures());
    } catch (e) {
      if (e instanceof BackendError) showToast(e.message, 'error');
    }
  }, [showToast]);

  const act = useCallback(
    async (action: GameAction) => {
      try {
        const res = await backend.act(action);
        clockOffset.current = res.serverNow - Date.now();
        setPlayer(res.player);
        setNearby(res.nearby);
        if (res.event.kind === 'tame_feed' && res.event.tamed) void refreshCreatures();
        return res;
      } catch (e) {
        const message = e instanceof BackendError ? e.message : 'Something went wrong.';
        // Location syncs fail quietly; everything else tells the player why.
        if (action.type !== 'sync') showToast(message, 'error');
        return null;
      }
    },
    [refreshCreatures, showToast],
  );

  // --- account -------------------------------------------------------------
  useEffect(() => {
    let alive = true;
    backend.getAccount().then((a) => alive && setAccount(a));
    const off = backend.onAccountChange((a) => {
      setAccount(a);
      if (!a) {
        setPlayer(null);
        setNearby(null);
        setCreatures([]);
      }
    });
    return () => {
      alive = false;
      off();
    };
  }, []);

  useEffect(() => {
    if (!account) return;
    // Initial load from the server; state is set when the request resolves.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void act({ type: 'sync' });
    void refreshCreatures();
  }, [account, act, refreshCreatures]);

  // --- GPS -------------------------------------------------------------------
  useEffect(() => {
    if (!account) return;
    let sub: Location.LocationSubscription | null = null;
    let cancelled = false;
    (async () => {
      const forceSim = process.env.EXPO_PUBLIC_SIMULATE_LOCATION === '1';
      const { status } = forceSim ? { status: 'denied' } : await Location.requestForegroundPermissionsAsync();
      if (cancelled) return;
      if (status !== 'granted') {
        if (__DEV__ || forceSim) {
          setGps('simulated');
          setPosition((p) => p ?? SIM_START);
        } else {
          setGps('denied');
        }
        return;
      }
      setGps('ok');
      sub = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, timeInterval: 3000, distanceInterval: 5 },
        (loc) => {
          accuracyRef.current = loc.coords.accuracy;
          setPosition({ lat: loc.coords.latitude, lng: loc.coords.longitude });
        },
      );
      if (cancelled) sub.remove();
    })();
    return () => {
      cancelled = true;
      sub?.remove();
    };
  }, [account]);

  const lastSync = useRef<{ at: number; pos: LatLng } | null>(null);
  const syncing = useRef(false);

  const sync = useCallback(
    async (pos: LatLng, force = false) => {
      const last = lastSync.current;
      const due =
        force ||
        !last ||
        (Date.now() - last.at >= SYNC_MIN_INTERVAL_MS && distanceMeters(last.pos, pos) >= SYNC_MIN_MOVE_M);
      if (!due || syncing.current) return;
      syncing.current = true;
      lastSync.current = { at: Date.now(), pos };
      const res = await act({ type: 'sync', location: { ...pos, accuracy: accuracyRef.current } });
      syncing.current = false;
      const r = res?.event.kind === 'location' ? res.event.result : null;
      if (r && !r.accepted && r.reason === 'too_fast') {
        showToast('Whoa, slow down! Movement that fast is ignored.', 'error');
      }
    },
    [act, showToast],
  );

  useEffect(() => {
    if (!position) return;
    void sync(position);
    // Trailing sync so the last move inside the throttle window isn't lost.
    const id = setTimeout(() => void sync(position), SYNC_MIN_INTERVAL_MS + 100);
    return () => clearTimeout(id);
  }, [position, sync]);

  useEffect(() => {
    if (!account || !position) return;
    const id = setInterval(() => void sync(position, true), SYNC_HEARTBEAT_MS);
    return () => clearInterval(id);
  }, [account, position, sync]);

  const simulateStep = useCallback(
    (northM: number, eastM: number) => {
      if (gps !== 'simulated') return;
      setPosition((p) => offsetMeters(p ?? SIM_START, northM, eastM));
    },
    [gps],
  );

  const value = useMemo<GameContextValue>(
    () => ({
      mode: backend.mode,
      account,
      player,
      nearby,
      gps,
      position,
      serverNow,
      act,
      creatures,
      refreshCreatures,
      toast,
      showToast,
      simulateStep,
    }),
    [account, player, nearby, gps, position, serverNow, act, creatures, refreshCreatures, toast, showToast, simulateStep],
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used inside GameProvider');
  return ctx;
}

/** Re-render on an interval (for countdowns and animations). */
export function useTicker(intervalMs: number): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}
