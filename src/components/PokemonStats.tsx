import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { PokemonStat } from '../types/pokemon';

type Props = {
  stats: PokemonStat[];
};

export default function PokemonStats({ stats }: Props) {
  return (
    <View style={{ marginVertical: 5 }}>
      {stats.map((s) => (
        <View key={s.stat.name} style={styles.statRow}>
          <Text style={styles.statText}>
            {s.stat.name}: {s.base_stat}
          </Text>
          <View style={styles.statBar}>
            <View
              style={[
                styles.statFill,
                { width: `${(s.base_stat / 255) * 100}%` },
              ]}
            />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  statRow: { marginBottom: 8 },
  statText: { fontSize: 16, fontWeight: 'bold', textTransform: 'capitalize' },
  statBar: {
    height: 12,
    width: '100%',
    backgroundColor: '#ddd',
    borderRadius: 6,
    overflow: 'hidden',
  },
  statFill: {
    height: 12,
    backgroundColor: '#ff6347',
    borderRadius: 6,
  },
});
