import {
  CREATURES_BY_ID,
  INTERACT_RADIUS_M,
  type LatLng,
  type NearbyCreature,
  type NearbyNode,
  distanceMeters,
} from '@game';
import { router } from 'expo-router';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SurvivalHud } from '@/components/SurvivalHud';
import { Button } from '@/components/ui';
import { GameMap } from '@/components/map/GameMap';
import { NODE_LABEL } from '@/components/map/types';
import { useGame, useTicker } from '@/game/GameProvider';
import { formatLoot } from '@/game/format';
import { colors, radius, space } from '@/theme';

const BIOME_LABEL = { forest: '🌲 Forest', plains: '🌾 Plains', wetland: '💧 Wetland', urban: '🏙️ Urban' };

export default function Explore() {
  const { player, nearby, position, gps, serverNow, act, showToast, simulateStep } = useGame();
  const insets = useSafeAreaInsets();
  useTicker(1000);
  const now = serverNow();

  if (!player) return null;
  const here: LatLng | null = player.location ?? position;

  if (gps === 'denied') {
    return (
      <View style={[styles.blocked, { paddingTop: insets.top }]}>
        <Text style={styles.blockedIcon}>📍</Text>
        <Text style={styles.blockedTitle}>Location is off</Text>
        <Text style={styles.blockedText}>
          Primal Trail needs your location to show creatures and resources nearby. It is never shared with other players.
        </Text>
        <Button title="Open settings" onPress={() => Linking.openSettings()} />
      </View>
    );
  }

  const distTo = (p: LatLng) => (here ? distanceMeters(here, p) : Infinity);

  function tooFar(p: LatLng): boolean {
    const d = distTo(p);
    if (d <= INTERACT_RADIUS_M) return false;
    showToast(`Walk closer: ${Math.round(d - INTERACT_RADIUS_M)} m to go.`);
    return true;
  }

  async function onPressNode(n: NearbyNode) {
    if (n.readyAt !== null && n.readyAt > now) {
      return showToast(`${NODE_LABEL[n.type]} regrows in ${Math.ceil((n.readyAt - now) / 60_000)} min.`);
    }
    if (tooFar(n.pos)) return;
    const res = await act({ type: 'gather', nodeId: n.id });
    if (res?.event.kind === 'gather') showToast(`${formatLoot(res.event.loot)}  (+${res.event.xp} XP)`, 'success');
  }

  function onPressCreature(c: NearbyCreature) {
    const def = CREATURES_BY_ID[c.creatureId];
    if (distTo(c.pos) > INTERACT_RADIUS_M) {
      return showToast(`${def.name} (Lv ${c.level}) is ${Math.round(distTo(c.pos))} m away. Get within ${INTERACT_RADIUS_M} m.`);
    }
    router.push({ pathname: '/tame', params: { spawnId: c.id } });
  }

  const visible = nearby?.creatures.filter((c) => !c.spent) ?? [];
  const locked = player.lockedUntil > now;

  return (
    <View style={styles.screen}>
      {here ? (
        <GameMap
          center={position ?? here}
          creatures={visible}
          nodes={nearby?.nodes ?? []}
          now={now}
          onPressCreature={onPressCreature}
          onPressNode={onPressNode}
        />
      ) : (
        <View style={styles.blocked}>
          <Text style={styles.blockedIcon}>🛰️</Text>
          <Text style={styles.blockedTitle}>Finding your location…</Text>
        </View>
      )}

      <View style={[styles.top, { paddingTop: insets.top + space(2) }]} pointerEvents="box-none">
        <SurvivalHud player={player} />
        {locked && (
          <Text style={[styles.banner, { backgroundColor: colors.danger }]}>
            Unusual movement detected. Actions resume in {Math.ceil((player.lockedUntil - now) / 60_000)} min.
          </Text>
        )}
        {player.tameSession && (
          <Pressable
            onPress={() => router.push({ pathname: '/tame', params: { spawnId: player.tameSession!.spawnId } })}
            style={[styles.banner, { backgroundColor: colors.torpor }]}
          >
            <Text style={styles.bannerText}>
              Taming {CREATURES_BY_ID[player.tameSession.creatureId].name}… tap to return
            </Text>
          </Pressable>
        )}
      </View>

      <View style={styles.bottom} pointerEvents="box-none">
        <View style={styles.chips}>
          {nearby && <Text style={styles.chip}>{BIOME_LABEL[nearby.biome]}</Text>}
          {nearby && <Text style={styles.chip}>{nearby.night ? '🌙 Night' : '☀️ Day'}</Text>}
          <Text style={styles.chip} testID="nearby-count">
            🐾 {visible.length} nearby
          </Text>
          {gps === 'simulated' && <Text style={[styles.chip, { backgroundColor: colors.accent, color: colors.white }]}>Simulated GPS</Text>}
        </View>
        {gps === 'simulated' && <DevPad onStep={simulateStep} />}
      </View>
    </View>
  );
}

/** Walk around without leaving your desk (dev builds and web preview only). */
function DevPad({ onStep }: { onStep: (n: number, e: number) => void }) {
  const STEP = 15;
  const btn = (label: string, n: number, e: number, testID: string) => (
    <Pressable testID={testID} accessibilityLabel={`Walk ${testID.replace('walk-', '')}`} style={styles.padBtn} onPress={() => onStep(n, e)}>
      <Text style={styles.padText}>{label}</Text>
    </Pressable>
  );
  return (
    <View style={styles.pad}>
      <View style={styles.padRow}>{btn('▲', STEP, 0, 'walk-north')}</View>
      <View style={styles.padRow}>
        {btn('◀', 0, -STEP, 'walk-west')}
        <View style={styles.padBtnSpacer} />
        {btn('▶', 0, STEP, 'walk-east')}
      </View>
      <View style={styles.padRow}>{btn('▼', -STEP, 0, 'walk-south')}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  top: { position: 'absolute', left: space(3), right: space(3), top: 0, gap: space(2) },
  banner: { borderRadius: radius, padding: space(3), color: colors.white, fontWeight: '700', overflow: 'hidden' },
  bannerText: { color: colors.white, fontWeight: '700' },
  bottom: { position: 'absolute', left: space(3), right: space(3), bottom: space(3), gap: space(2), alignItems: 'flex-start' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space(2) },
  chip: {
    backgroundColor: '#FFFDF7EE',
    borderRadius: 999,
    paddingHorizontal: space(3),
    paddingVertical: space(1),
    fontSize: 13,
    fontWeight: '700',
    color: colors.ink,
    overflow: 'hidden',
  },
  blocked: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: space(8), gap: space(3), backgroundColor: colors.bg },
  blockedIcon: { fontSize: 56 },
  blockedTitle: { fontSize: 22, fontWeight: '800', color: colors.ink },
  blockedText: { fontSize: 15, color: colors.muted, textAlign: 'center', marginBottom: space(3) },
  pad: { alignSelf: 'flex-end', marginLeft: 'auto' },
  padRow: { flexDirection: 'row', justifyContent: 'center' },
  padBtn: {
    width: 44,
    height: 44,
    margin: 2,
    borderRadius: 10,
    backgroundColor: '#1F3A2BDD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  padBtnSpacer: { width: 48 },
  padText: { color: colors.white, fontSize: 18 },
});
