import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFavourites } from '../../context/FavouritesContext';

type Props = {
  id: number;
  name: string;
  onBack: () => void;
};

export default function PokemonHeader({ id, name, onBack }: Props) {
  const { addFavourite, removeFavourite, isFavourite } = useFavourites();

  return (
    <View style={styles.headerRow}>
      {/* Back button */}
      <TouchableOpacity style={styles.backBtn} onPress={onBack}>
        <Ionicons name="arrow-back" size={24} color="#ff4500" />
      </TouchableOpacity>

      {/* Title */}
      <Text style={styles.title} numberOfLines={1}>
        {name}
      </Text>

      {/* Favourite button */}
      <TouchableOpacity
        onPress={() =>
          isFavourite(name)
            ? removeFavourite(name)
            : addFavourite({ id, name })
        }
        style={styles.favBtn}
      >
        <Ionicons
          name={isFavourite(name) ? 'star' : 'star-outline'}
          size={32}
          color="#ffd700"
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  backBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#ffebcd',
  },
  favBtn: { padding: 8 },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textTransform: 'capitalize',
    color: '#ff4500',
    textAlign: 'center',
    flex: 1,
  },
});
