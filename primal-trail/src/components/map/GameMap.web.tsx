import { INTERACT_RADIUS_M, type LatLng, distanceMeters } from '@game';
import { useState } from 'react';
import { type LayoutChangeEvent, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '@/theme';

import { CreaturePin, NodePin, PlayerPin } from './Pins';
import type { GameMapProps } from './types';

// react-native-maps has no web support. This is a schematic stand-in so the
// game can be played and tested in a browser: the player sits in the middle
// and everything is drawn at its true distance and bearing.

const VIEW_RADIUS_M = 160;

function toEastNorth(origin: LatLng, p: LatLng) {
  const north = distanceMeters(origin, { lat: p.lat, lng: origin.lng }) * Math.sign(p.lat - origin.lat);
  const east = distanceMeters(origin, { lat: origin.lat, lng: p.lng }) * Math.sign(p.lng - origin.lng);
  return { east, north };
}

export function GameMap({ center, creatures, nodes, now, onPressCreature, onPressNode }: GameMapProps) {
  const [size, setSize] = useState({ w: 0, h: 0 });
  const onLayout = (e: LayoutChangeEvent) => setSize({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height });
  const pxPerM = Math.min(size.w, size.h) / 2 / VIEW_RADIUS_M;
  const place = (p: LatLng) => {
    const { east, north } = toEastNorth(center, p);
    return { left: size.w / 2 + east * pxPerM, top: size.h / 2 - north * pxPerM };
  };
  const inView = (p: LatLng) => {
    const { left, top } = place(p);
    return left > -30 && top > -30 && left < size.w + 30 && top < size.h + 30;
  };

  const grid = [];
  for (let m = 50; m <= VIEW_RADIUS_M * 2; m += 50) grid.push(m);

  return (
    <View style={styles.map} onLayout={onLayout} testID="game-map">
      {size.w > 0 && (
        <>
          {grid.map((m) => (
            <View
              key={m}
              pointerEvents="none"
              style={[
                styles.ring,
                {
                  width: m * 2 * pxPerM,
                  height: m * 2 * pxPerM,
                  borderRadius: m * pxPerM,
                  left: size.w / 2 - m * pxPerM,
                  top: size.h / 2 - m * pxPerM,
                },
              ]}
            />
          ))}
          <View
            pointerEvents="none"
            style={[
              styles.reach,
              {
                width: INTERACT_RADIUS_M * 2 * pxPerM,
                height: INTERACT_RADIUS_M * 2 * pxPerM,
                borderRadius: INTERACT_RADIUS_M * pxPerM,
                left: size.w / 2 - INTERACT_RADIUS_M * pxPerM,
                top: size.h / 2 - INTERACT_RADIUS_M * pxPerM,
              },
            ]}
          />
          {nodes.filter((n) => inView(n.pos)).map((n) => (
            <Pressable
              key={n.id}
              testID={`node-${n.type}`}
              accessibilityLabel={`${n.type} ${Math.round(distanceMeters(center, n.pos))} meters away`}
              onPress={() => onPressNode(n)}
              style={[styles.pin, place(n.pos), { marginLeft: -17, marginTop: -17 }]}
            >
              <NodePin node={n} ready={n.readyAt === null || n.readyAt <= now} />
            </Pressable>
          ))}
          {creatures
            .filter((c) => !c.spent && inView(c.pos))
            .map((c) => (
              <Pressable
                key={c.id}
                testID={`creature-${c.creatureId}`}
                accessibilityLabel={`${c.creatureId} ${Math.round(distanceMeters(center, c.pos))} meters away`}
                onPress={() => onPressCreature(c)}
                style={[styles.pin, place(c.pos), { marginLeft: -23, marginTop: -23 }]}
              >
                <CreaturePin creature={c} />
              </Pressable>
            ))}
          <View pointerEvents="none" style={[styles.pin, { left: size.w / 2 - 20, top: size.h / 2 - 20 }]}>
            <PlayerPin />
          </View>
          <Text style={styles.note}>Schematic map (web preview)</Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  map: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#CFE3C0', overflow: 'hidden' },
  ring: { position: 'absolute', borderWidth: 1, borderColor: '#2F6B4522' },
  reach: { position: 'absolute', borderWidth: 2, borderColor: '#2F6B4588', backgroundColor: '#2F6B4518' },
  pin: { position: 'absolute' },
  note: { position: 'absolute', bottom: 8, right: 10, fontSize: 11, color: colors.muted },
});
