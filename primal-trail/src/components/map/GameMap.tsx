import { INTERACT_RADIUS_M } from '@game';
import { useEffect, useRef } from 'react';
import { StyleSheet } from 'react-native';
import MapView, { Circle, Marker } from 'react-native-maps';

import { CreaturePin, NodePin, PlayerPin } from './Pins';
import type { GameMapProps } from './types';

const ll = (p: { lat: number; lng: number }) => ({ latitude: p.lat, longitude: p.lng });

export function GameMap({ center, creatures, nodes, now, onPressCreature, onPressNode }: GameMapProps) {
  const map = useRef<MapView>(null);

  // Keep the camera on the player, Pokémon GO style. Pan is off; zoom/rotate are on.
  useEffect(() => {
    map.current?.animateCamera({ center: ll(center) }, { duration: 600 });
  }, [center]);

  return (
    <MapView
      ref={map}
      style={StyleSheet.absoluteFill}
      initialCamera={{ center: ll(center), pitch: 45, heading: 0, zoom: 17.5, altitude: 500 }}
      scrollEnabled={false}
      pitchEnabled
      rotateEnabled
      zoomEnabled
      minZoomLevel={15}
      showsPointsOfInterests={false}
      showsCompass={false}
      toolbarEnabled={false}
    >
      <Circle
        center={ll(center)}
        radius={INTERACT_RADIUS_M}
        strokeColor="#2F6B4588"
        fillColor="#2F6B4518"
        strokeWidth={2}
      />
      {nodes.map((n) => {
        const ready = n.readyAt === null || n.readyAt <= now;
        return (
        <Marker
          // remount on readiness change: markers don't redraw with tracksViewChanges off
          key={`${n.id}:${ready}`}
          coordinate={ll(n.pos)}
          anchor={{ x: 0.5, y: 0.5 }}
          onPress={() => onPressNode(n)}
          tracksViewChanges={false}
        >
          <NodePin node={n} ready={ready} />
        </Marker>
        );
      })}
      {creatures
        .filter((c) => !c.spent)
        .map((c) => (
          <Marker
            key={c.id}
            coordinate={ll(c.pos)}
            anchor={{ x: 0.5, y: 0.5 }}
            onPress={() => onPressCreature(c)}
            tracksViewChanges={false}
          >
            <CreaturePin creature={c} />
          </Marker>
        ))}
      <Marker coordinate={ll(center)} anchor={{ x: 0.5, y: 0.5 }} tracksViewChanges={false}>
        <PlayerPin />
      </Marker>
    </MapView>
  );
}
