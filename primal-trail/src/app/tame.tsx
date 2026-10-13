import {
  CREATURES_BY_ID,
  ITEMS,
  type ItemId,
  RARITY_TUNING,
  RULES,
  type TameSession,
  type TamedCreature,
  WEAPONS,
  type WeaponId,
  isTamingFood,
  isWatching,
} from '@game';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { backend } from '@/backend';
import { Bar, Button, Card, Muted, Pill } from '@/components/ui';
import { formatSeconds } from '@/game/format';
import { useGame, useTicker } from '@/game/GameProvider';
import { colors, radius, rarityColor, space } from '@/theme';

type Phase = 'starting' | 'active' | 'tamed' | 'lost';

export default function Tame() {
  const { spawnId } = useLocalSearchParams<{ spawnId: string }>();
  const { player, act, showToast } = useGame();
  const [phase, setPhase] = useState<Phase>('starting');
  const [info, setInfo] = useState<{ creatureId: string; level: number; knockedOut: boolean } | null>(null);
  const [tamed, setTamed] = useState<TamedCreature | null>(null);
  const [lostReason, setLostReason] = useState('');
  // While a feed is in flight the session may vanish because we tamed it.
  const [feeding, setFeeding] = useState(false);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    act({ type: 'tame_start', spawnId }).then((r) => {
      if (r?.event.kind !== 'tame_start') return router.back();
      const s = r.event.session;
      setInfo({ creatureId: s.creatureId, level: s.level, knockedOut: s.knockedOutAt !== null });
      setPhase('active');
    });
  }, [act, spawnId]);

  const session = player?.tameSession?.spawnId === spawnId ? player.tameSession : null;
  const knockedOut = info?.knockedOut || !!session?.knockedOutAt;
  // The server ends sessions on its own (creature woke up, or wandered off).
  const vanished = phase === 'active' && !session && !feeding;
  const shown: Phase = vanished ? 'lost' : phase;
  const reason = vanished ? (knockedOut ? 'It woke up and ran off.' : 'It wandered off.') : lostReason;

  const def = CREATURES_BY_ID[info?.creatureId ?? ''];

  async function onFeed(itemId: ItemId) {
    setFeeding(true);
    const r = await act({ type: 'tame_feed', itemId });
    setFeeding(false);
    if (r?.event.kind !== 'tame_feed') return;
    const { outcome } = r.event;
    if (outcome === 'tamed') {
      setTamed(r.event.tamed);
      setPhase('tamed');
    } else if (outcome === 'fled') {
      setLostReason(`${def.name} spotted you again and fled.`);
      setPhase('lost');
    } else if (outcome === 'spotted') {
      showToast('It saw you! Wait until it looks away. Once more and it flees.', 'error');
    }
  }

  async function leave() {
    if (shown === 'active') await act({ type: 'tame_abandon' });
    router.back();
  }

  if (!def || shown === 'starting') {
    return (
      <SafeAreaView style={styles.safe}>
        <Text style={styles.loading}>Sneaking closer…</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={leave} accessibilityRole="button" testID="leave-tame" hitSlop={12}>
            <Text style={styles.close}>✕</Text>
          </Pressable>
          <Pill text={def.rarity} color={rarityColor[def.rarity]} />
        </View>

        <View style={styles.hero}>
          <Text style={styles.heroEmoji}>{shown === 'lost' ? '💨' : def.emoji}</Text>
          <Text style={styles.name}>{def.name}</Text>
          <Muted>
            Lv {info?.level} · {def.role} · {def.tameMethod === 'passive' ? 'gentle tame' : 'knockout tame'}
          </Muted>
        </View>

        {shown === 'active' && session && session.method === 'knockout' && session.knockedOutAt === null && (
          <KnockoutPanel session={session} />
        )}
        {shown === 'active' && session && (session.method === 'passive' || session.knockedOutAt !== null) && (
          <FeedPanel session={session} onFeed={onFeed} />
        )}
        {shown === 'tamed' && tamed && <TamedPanel tamed={tamed} />}
        {shown === 'lost' && (
          <Card style={{ alignItems: 'center', gap: space(3) }}>
            <Text style={styles.big}>Got away!</Text>
            <Muted style={{ textAlign: 'center' }}>{reason}</Muted>
            <Button title="Back to the map" onPress={() => router.back()} style={{ alignSelf: 'stretch' }} />
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ---------------------------------------------------------------------------
// Knockout: time your shot as the reticle sweeps across the target zone.

const SWEEP_MS = 1400;
const ZONE: Record<string, number> = { common: 0.3, uncommon: 0.22, rare: 0.16, epic: 0.12, legendary: 0.1 };

function reticleAt(t: number): number {
  const phase = (t % SWEEP_MS) / SWEEP_MS;
  return phase < 0.5 ? phase * 2 : 2 - phase * 2; // 0 → 1 → 0
}

function KnockoutPanel({ session }: { session: TameSession }) {
  const { player, act } = useGame();
  const t = useTicker(33);
  const def = CREATURES_BY_ID[session.creatureId];
  const minTier = WEAPONS[def.minWeapon ?? 'slingshot'].tier;
  const usable = (Object.keys(WEAPONS) as WeaponId[]).filter(
    (w) => (player?.inventory[w] ?? 0) > 0 && WEAPONS[w].tier >= minTier,
  );
  const [weapon, setWeapon] = useState<WeaponId>(usable[usable.length - 1] ?? 'slingshot');
  const [flash, setFlash] = useState<{ text: string; color: string } | null>(null);
  const zone = ZONE[def.rarity];
  const pos = reticleAt(t);
  const ammo = WEAPONS[weapon].ammo;
  const ammoLeft = player?.inventory[ammo] ?? 0;

  async function fire() {
    const p = reticleAt(Date.now());
    const off = Math.abs(p - 0.5);
    const accuracy = off <= zone / 2 ? 1 - (off / (zone / 2)) * 0.4 : 0;
    setFlash(accuracy >= 0.9 ? { text: 'Perfect!', color: colors.primary } : accuracy > 0 ? { text: 'Hit', color: colors.accent } : { text: 'Miss', color: colors.danger });
    const r = await act({ type: 'tame_shoot', weapon, accuracy });
    if (r?.event.kind === 'tame_shoot' && r.event.knockedOut) setFlash({ text: 'Knocked out!', color: colors.torpor });
  }

  return (
    <Card style={{ gap: space(4) }}>
      <Text style={styles.step}>1 · Knock it out</Text>
      <Muted>Fire when the marker is inside the green zone. Dead center does the most.</Muted>

      <View style={styles.aimTrack} testID="aim-track">
        <View style={[styles.aimZone, { left: `${(0.5 - zone / 2) * 100}%`, width: `${zone * 100}%` }]} />
        <View style={[styles.aimCenter, { left: '50%' }]} />
        <View testID="reticle" style={[styles.reticle, { left: `${pos * 100}%` }]} />
      </View>

      <View>
        <View style={styles.rowBetween}>
          <Text style={styles.label}>💤 Torpor</Text>
          <Text style={styles.label}>
            {session.torpor}/{session.torporNeeded}
          </Text>
        </View>
        <Bar value={session.torpor} max={session.torporNeeded} color={colors.torpor} height={12} label="Torpor" />
      </View>

      {usable.length > 1 && (
        <View style={styles.chips}>
          {usable.map((w) => (
            <Chip key={w} selected={w === weapon} onPress={() => setWeapon(w)} text={`${ITEMS[w].emoji} ${ITEMS[w].name}`} />
          ))}
        </View>
      )}

      <View style={styles.rowBetween}>
        <Text style={[styles.flash, { color: flash?.color ?? 'transparent' }]}>{flash?.text ?? '·'}</Text>
        <Muted>
          {ITEMS[ammo].emoji} {ammoLeft} {ITEMS[ammo].name}
        </Muted>
      </View>
      <Button testID="fire" title={`Fire ${ITEMS[weapon].name}`} onPress={fire} disabled={ammoLeft === 0} variant="secondary" />
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Feeding: works for knocked-out creatures and passive (stealth) tames.

function FeedPanel({ session, onFeed }: { session: TameSession; onFeed: (id: ItemId) => void }) {
  const { player, serverNow } = useGame();
  useTicker(100);
  const def = CREATURES_BY_ID[session.creatureId];
  const now = serverNow();
  const foods = (Object.entries(player?.inventory ?? {}) as [ItemId, number][])
    .filter(([id, n]) => n > 0 && isTamingFood(id))
    .sort(([a], [b]) => Number(b === def.preferredFood) - Number(a === def.preferredFood));
  const [food, setFood] = useState<ItemId | null>(null);
  const selected = food && (player?.inventory[food] ?? 0) > 0 ? food : (foods[0]?.[0] ?? null);

  const cooldown = session.lastFedAt ? session.lastFedAt + RARITY_TUNING[def.rarity].feedIntervalMs - now : 0;
  const passive = session.method === 'passive';
  const watching = passive && isWatching(session.spawnId, now);
  const wakesIn = session.knockedOutAt !== null ? session.knockedOutAt + RULES.knockoutMs - now : null;

  return (
    <Card style={{ gap: space(4) }}>
      <Text style={styles.step}>{passive ? 'Feed it without being seen' : '2 · Feed it before it wakes'}</Text>

      {passive ? (
        <View style={[styles.watch, { backgroundColor: watching ? '#C2452D22' : '#2F6B4522' }]} testID={watching ? 'watching' : 'not-watching'}>
          <Text style={styles.watchEmoji}>{watching ? '👀' : '🙈'}</Text>
          <Text style={[styles.watchText, { color: watching ? colors.danger : colors.primary }]}>
            {watching ? 'It’s looking around. Stay still…' : 'Looking away. Feed now!'}
          </Text>
          <Muted>Spotted {session.spotted}/{RULES.passiveSpotsToFlee}</Muted>
        </View>
      ) : (
        wakesIn !== null && <Muted>⏰ Wakes up in {formatSeconds(wakesIn)}</Muted>
      )}

      <View>
        <View style={styles.rowBetween}>
          <Text style={styles.label}>🤝 Taming</Text>
          <Text style={styles.label}>{Math.floor(session.progress)}%</Text>
        </View>
        <Bar value={session.progress} color={colors.primary} height={12} label="Taming progress" />
        <Muted style={{ marginTop: 4 }}>Effectiveness {Math.round(session.effectiveness * 100)}% · favorite food: {ITEMS[def.preferredFood].emoji} {ITEMS[def.preferredFood].name}</Muted>
      </View>

      {foods.length === 0 ? (
        <Muted>You&apos;re out of taming food. Gather berries or craft kibble.</Muted>
      ) : (
        <View style={styles.chips}>
          {foods.map(([id, n]) => (
            <Chip
              key={id}
              testID={`food-${id}`}
              selected={id === selected}
              onPress={() => setFood(id)}
              text={`${id === def.preferredFood ? '★ ' : ''}${ITEMS[id].emoji} ${ITEMS[id].name} ×${n}`}
            />
          ))}
        </View>
      )}
      <Button
        testID="feed"
        title={cooldown > 0 ? `Chewing… ${formatSeconds(cooldown)}` : 'Feed'}
        disabled={!selected || cooldown > 0}
        onPress={() => selected && onFeed(selected)}
      />
    </Card>
  );
}

function TamedPanel({ tamed }: { tamed: TamedCreature }) {
  const { refreshCreatures, showToast } = useGame();
  const def = CREATURES_BY_ID[tamed.creatureId];
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  async function done() {
    if (name.trim()) {
      setSaving(true);
      try {
        await backend.renameCreature(tamed.id, name);
        await refreshCreatures();
      } catch {
        showToast("Couldn't save the name. You can rename it later.", 'error');
      }
    }
    router.back();
  }

  return (
    <Card style={{ gap: space(3) }}>
      <Text style={styles.big} testID="tamed-title">
        🎉 Tamed!
      </Text>
      <Muted style={{ textAlign: 'center' }}>
        {def.name} joined you at level {tamed.level}.
      </Muted>
      <View style={styles.stats}>
        {Object.entries(tamed.stats).map(([k, v]) => (
          <View key={k} style={styles.stat}>
            <Text style={styles.statValue}>{v}</Text>
            <Muted>{k}</Muted>
          </View>
        ))}
      </View>
      <TextInput
        testID="nickname"
        style={styles.input}
        placeholder={`Name your ${def.name} (optional)`}
        placeholderTextColor={colors.muted}
        maxLength={24}
        value={name}
        onChangeText={setName}
      />
      <Button testID="tame-done" title="Done" busy={saving} onPress={done} />
    </Card>
  );
}

function Chip({ text, selected, onPress, testID }: { text: string; selected: boolean; onPress: () => void; testID?: string }) {
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={[styles.chip, selected && styles.chipSelected]}
    >
      <Text style={[styles.chipText, selected && { color: colors.white }]}>{text}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  loading: { textAlign: 'center', marginTop: 120, fontSize: 18, color: colors.muted },
  container: { padding: space(4), gap: space(4), maxWidth: 560, width: '100%', alignSelf: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  close: { fontSize: 24, color: colors.muted, padding: space(1) },
  hero: { alignItems: 'center', gap: space(1) },
  heroEmoji: { fontSize: 96 },
  name: { fontSize: 28, fontWeight: '900', color: colors.ink },
  step: { fontSize: 18, fontWeight: '800', color: colors.ink },
  big: { fontSize: 26, fontWeight: '900', color: colors.ink, textAlign: 'center' },
  label: { fontSize: 13, fontWeight: '700', color: colors.ink, marginBottom: 4 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  aimTrack: { height: 44, borderRadius: radius, backgroundColor: '#00000014', overflow: 'hidden', justifyContent: 'center' },
  aimZone: { position: 'absolute', top: 0, bottom: 0, backgroundColor: '#4A9E5C66' },
  aimCenter: { position: 'absolute', top: 6, bottom: 6, width: 2, marginLeft: -1, backgroundColor: colors.primary },
  reticle: { position: 'absolute', top: 2, bottom: 2, width: 6, marginLeft: -3, borderRadius: 3, backgroundColor: colors.danger },
  flash: { fontSize: 18, fontWeight: '900' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space(2) },
  chip: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 999,
    paddingHorizontal: space(3),
    paddingVertical: space(2),
    backgroundColor: colors.card,
  },
  chipSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 14, fontWeight: '600', color: colors.ink },
  watch: { alignItems: 'center', padding: space(4), borderRadius: radius, gap: space(1) },
  watchEmoji: { fontSize: 40 },
  watchText: { fontSize: 17, fontWeight: '800' },
  stats: { flexDirection: 'row', justifyContent: 'space-around' },
  stat: { alignItems: 'center' },
  statValue: { fontSize: 22, fontWeight: '900', color: colors.ink },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius,
    paddingHorizontal: space(4),
    minHeight: 48,
    fontSize: 16,
    color: colors.ink,
    backgroundColor: colors.white,
  },
});
