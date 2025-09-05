// components/PokemonCard.tsx
import React, { memo, useCallback } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Pokemon } from '../types/pokemon';
import { Ionicons } from '@expo/vector-icons';
import { getTypeColor } from '../../utils/pokemonTypes';
import { useFavourites } from '../../context/FavouritesContext';
import { useRouter } from 'expo-router';

type Props = { item: Pokemon };

function PokemonCardInner({ item }: Props) {
  const router = useRouter();
  const { addFavourite, removeFavourite, isFavourite } = useFavourites();

  const onPressCard = useCallback(() => {
    router.push(`/pokemon/${item.name}`);
  }, [router, item.name]);

  const onToggleFav = useCallback(() => {
    isFavourite(item.name)
      ? removeFavourite(item.name)
      : addFavourite({ id: item.id, name: item.name });
  }, [item, isFavourite, addFavourite, removeFavourite]);

  const spriteUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${item.id}.png`;

  return (
    <TouchableOpacity onPress={onPressCard} activeOpacity={0.9} style={styles.card}>
      <Image source={{ uri: spriteUrl }} style={styles.sprite} />
      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>
        <View style={styles.types}>
          {item.pokemontypes?.map((t) => (
            <View key={t.type.name} style={[styles.typeBadge, { backgroundColor: getTypeColor(t.type.name) }]}>
              <Text style={styles.typeText}>{t.type.name}</Text>
            </View>
          ))}
        </View>
      </View>

      <TouchableOpacity onPress={onToggleFav} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
        <Ionicons name={isFavourite(item.name) ? 'star' : 'star-outline'} size={24} color="#ffd700" />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

export const PokemonCard = memo(PokemonCardInner);

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: '#fff', borderRadius: 12, marginBottom: 12 },
  sprite: { width: 48, height: 48, marginRight: 12 },
  info: { flex: 1 },
  name: { fontSize: 18, fontWeight: '700', textTransform: 'capitalize' },
  types: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 6 },
  typeBadge: { paddingVertical: 2, paddingHorizontal: 8, borderRadius: 8, marginRight: 6, marginBottom: 6 },
  typeText: { color: '#fff', fontWeight: '700', textTransform: 'capitalize' },
});
