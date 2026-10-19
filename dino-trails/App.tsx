import * as Location from 'expo-location';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

import { DinoCard } from './src/components/DinoCard';
import { SafetyScreen } from './src/components/SafetyScreen';
import { TIER_COLORS } from './src/data/species';
import { distanceMeters, LatLng } from './src/game/geo';
import { Spawn, spawnsNear } from './src/game/spawns';

/** Above this speed (meters/second, ≈ 15 mph) dinos hide — you're probably in a car. */
const MAX_SPEED_MPS = 7;

type PermissionState = 'asking' | 'granted' | 'denied';

export default function App() {
  const [accepted, setAccepted] = useState(false);
  const [permission, setPermission] = useState<PermissionState>('asking');
  const [player, setPlayer] = useState<LatLng | null>(null);
  const [tooFast, setTooFast] = useState(false);
  const [now, setNow] = useState(Date.now());
  const [selected, setSelected] = useState<Spawn | null>(null);

  // Ask for location once the player has seen the safety screen, then follow them.
  useEffect(() => {
    if (!accepted) return;
    let subscription: Location.LocationSubscription | undefined;
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setPermission('denied');
        return;
      }
      setPermission('granted');
      subscription = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, distanceInterval: 5, timeInterval: 2000 },
        ({ coords }) => {
          setPlayer({ latitude: coords.latitude, longitude: coords.longitude });
          // iOS reports -1 when it doesn't know the speed, so only trust positive values.
          setTooFast(coords.speed !== null && coords.speed > MAX_SPEED_MPS);
        },
      );
    })();
    return () => subscription?.remove();
  }, [accepted]);

  // Tick every 30 s so dinos refresh when a new 15-minute spawn window starts.
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(timer);
  }, []);

  const spawns = useMemo(
    () => (player && !tooFast ? spawnsNear(player, now) : []),
    [player, now, tooFast],
  );

  // Close the card if its dino despawned or we started moving too fast.
  useEffect(() => {
    if (selected && !spawns.some((s) => s.id === selected.id)) setSelected(null);
  }, [spawns, selected]);

  if (!accepted) return <SafetyScreen onAccept={() => setAccepted(true)} />;

  if (permission === 'denied') {
    return (
      <View style={styles.center}>
        <Text style={styles.centerText}>
          Dino Trails needs your location to show dinos near you.
        </Text>
        <Pressable style={styles.button} onPress={() => Linking.openSettings()}>
          <Text style={styles.buttonText}>Open Settings</Text>
        </Pressable>
      </View>
    );
  }

  if (!player) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#689F38" />
        <Text style={styles.centerText}>Finding your location…</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <MapView
        style={StyleSheet.absoluteFill}
        initialRegion={{ ...player, latitudeDelta: 0.008, longitudeDelta: 0.008 }}
        showsUserLocation
        followsUserLocation
        showsPointsOfInterests={false}
        showsCompass={false}
      >
        {spawns.map((spawn) => (
          <Marker
            key={spawn.id}
            coordinate={spawn.coordinate}
            onPress={() => setSelected(spawn)}
          >
            <View style={[styles.marker, { borderColor: TIER_COLORS[spawn.species.tier] }]}>
              <Text style={styles.markerEmoji}>{spawn.species.emoji}</Text>
            </View>
          </Marker>
        ))}
      </MapView>

      <View style={styles.hud}>
        <Text style={styles.hudText}>🦖 {spawns.length} dinos nearby</Text>
      </View>

      {tooFast && (
        <View style={styles.speedLock}>
          <Text style={styles.speedLockTitle}>You're moving too fast</Text>
          <Text style={styles.speedLockBody}>
            Dinos hide when you're in a vehicle. Never play while driving.
          </Text>
        </View>
      )}

      {selected && (
        <DinoCard
          spawn={selected}
          distance={distanceMeters(player, selected.coordinate)}
          now={now}
          onClose={() => setSelected(null)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 20 },
  centerText: { fontSize: 17, textAlign: 'center', color: '#333' },
  button: { backgroundColor: '#689F38', borderRadius: 12, paddingVertical: 14, paddingHorizontal: 24 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  marker: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 3,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerEmoji: { fontSize: 24 },
  hud: {
    position: 'absolute',
    top: 60,
    alignSelf: 'center',
    backgroundColor: 'rgba(27,42,27,0.85)',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  hudText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  speedLock: {
    position: 'absolute',
    top: 110,
    left: 16,
    right: 16,
    backgroundColor: '#D32F2F',
    borderRadius: 16,
    padding: 16,
  },
  speedLockTitle: { color: '#fff', fontWeight: '800', fontSize: 18, marginBottom: 4 },
  speedLockBody: { color: '#fff', fontSize: 15 },
});
