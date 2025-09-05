import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getTypeColor } from '../../utils/pokemonTypes';

type BadgeItem = {
  name: string;
  isHidden?: boolean; // for abilities
};

type Props = {
  items: BadgeItem[];
  variant: 'type' | 'ability';
};

export default function PokemonBadges({ items, variant }: Props) {
  return (
    <View style={styles.rowWrap}>
      {items.map((item, index) => {
        const bgColor =
          variant === 'type'
            ? getTypeColor(item.name)
            : item.isHidden
            ? '#6a5acd'
            : '#20b2aa';

        return (
          <View key={index} style={[styles.badge, { backgroundColor: bgColor }]}>
            <Text style={styles.text}>
              {item.name}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  rowWrap: { flexDirection: 'row', flexWrap: 'wrap', marginVertical: 5 },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 5,
  },
  text: { color: 'white', fontWeight: 'bold', textTransform: 'capitalize' },
});
