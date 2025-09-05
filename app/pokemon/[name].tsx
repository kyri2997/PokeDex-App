import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useQuery } from '@apollo/client/react';
import { gql } from '@apollo/client';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useFavourites } from '../../context/FavouritesContext';
import { getTypeColor } from '../../utils/pokemonTypes';
import { GET_POKEMON_BASIC } from '../../src/graphql/queries';
import { Pokemon } from '../../src/types/pokemon';
import  PokemonHeader from '@/components/PokemonHeader';
import  PokemonBadges from '@/components/PokemonBadges';
import PokemonStats from '@/components/PokemonStats';

type PokemonRestDetails = {
  types: { slot: number; type: { name: string } }[];
  abilities: { ability: { name: string }; is_hidden: boolean }[];
  stats: { stat: { name: string }; base_stat: number }[];
  species: { url: string };
};

type SpeciesInfo = { flavor: string; generation?: string };

type Evolution = { name: string; id: number };

export default function PokemonDetails() {
  const { name } = useLocalSearchParams<{ name: string }>();
  const pokemonName = Array.isArray(name) ? name[0] : name ?? '';
  const router = useRouter();
  const { addFavourite, removeFavourite, isFavourite } = useFavourites();

  // GraphQL basic Pokémon info
  const { data, loading, error } = useQuery<{ pokemon: Pokemon[] }>(
    GET_POKEMON_BASIC,
    { variables: { name: pokemonName.toLowerCase() } }
  );

  const [restDetails, setRestDetails] = useState<PokemonRestDetails | null>(null);
  const [speciesInfo, setSpeciesInfo] = useState<SpeciesInfo | null>(null);
  const [evolutions, setEvolutions] = useState<Evolution[]>([]);



  // Conditional back: comes from query param or default
    const { from } = useLocalSearchParams<{ from?: string }>();

    const handleBack = () => {
    switch (from) {
        case 'favourites':
        router.replace('/favourites'); // use replace to avoid stacking
        break;
        case 'pokedex':
        default:
        router.replace('/'); 
        break;
    }
    };



  // Fetch REST API details
  useEffect(() => {
    if (!pokemonName) return;
    let isCancelled = false;

    const fetchDetails = async () => {
      try {
        // 1️⃣ Main Pokémon data
        const resPokemon = await fetch(
          `https://pokeapi.co/api/v2/pokemon/${pokemonName.toLowerCase()}`
        );
        if (!resPokemon.ok) throw new Error('Failed to fetch Pokémon');
        const pokemonJson: PokemonRestDetails = await resPokemon.json();
        if (!isCancelled) setRestDetails(pokemonJson);

        // 2️⃣ Species for flavor & generation
        const resSpecies = await fetch(pokemonJson.species.url);
        if (!resSpecies.ok) throw new Error('Failed to fetch species');
        const speciesJson = await resSpecies.json();

        const flavorEntry = speciesJson.flavor_text_entries.find(
          (entry: any) => entry.language.name === 'en'
        );
        const flavor = flavorEntry
          ? flavorEntry.flavor_text.replace(/\n|\f/g, ' ')
          : 'No flavor text available.';
        const generation = speciesJson.generation?.name;

        if (!isCancelled) setSpeciesInfo({ flavor, generation });

        // 3️⃣ Evolution chain
        const resEvolution = await fetch(speciesJson.evolution_chain.url);
        if (!resEvolution.ok) throw new Error('Failed to fetch evolution chain');
        const evoJson = await resEvolution.json();

        // Flatten evolution chain
        const evoNames: string[] = [];
        const traverse = (node: any) => {
          if (!node) return;
          evoNames.push(node.species.name);
          node.evolves_to?.forEach(traverse);
        };
        traverse(evoJson.chain);

        // Fetch evolution IDs
        const evoWithIds = await Promise.all(
          evoNames.map(async (n) => {
            try {
              const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${n}`);
              if (!res.ok) return { name: n, id: 0 };
              const json = await res.json();
              return { name: n, id: json.id };
            } catch {
              return { name: n, id: 0 };
            }
          })
        );

        if (!isCancelled)
          setEvolutions(evoWithIds.filter((e) => e.id > 0));
      } catch (err) {
        console.error(err);
      }
    };

    fetchDetails();
    return () => {
      isCancelled = true;
    };
  }, [pokemonName]);

  if (loading) return <Text>Loading basic info...</Text>;
  if (error) return <Text>Error: {error.message}</Text>;
  if (!data?.pokemon[0]) return <Text>Pokémon not found.</Text>;

  const pokemon = data.pokemon[0];
  const spriteUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 60 }}
    >
        {/* Header with back and fav */}
        <PokemonHeader
            id={pokemon.id}
            name={pokemon.name}
            onBack={handleBack}
            />

      {/* Sprite */}
      <Image source={{ uri: spriteUrl }} style={styles.sprite} />

      {/* Basic Info: ID, Height, Weight */}
      <View style={styles.basicInfo}>
        <Text>
          <Text style={styles.bold}>ID: </Text>
          {pokemon.id}
        </Text>
        <Text>
          <Text style={styles.bold}>Height: </Text>
          {pokemon.height / 10} m
        </Text>
        <Text>
          <Text style={styles.bold}>Weight: </Text>
          {pokemon.weight / 10} kg
        </Text>
      </View>

      {restDetails && (
        <>
          {/* Types */}
            <Text style={styles.sectionTitle}>Types:</Text>
            <PokemonBadges items={restDetails.types.map(t => ({ name: t.type.name }))} variant="type" />

            {/* Abilities */}
            <Text style={styles.sectionTitle}>Abilities:</Text>
            <PokemonBadges
            items={restDetails.abilities.map(a => ({ name: a.ability.name, isHidden: a.is_hidden }))}
            variant="ability"
            />

          {/* Generation */}
          {speciesInfo?.generation && (
            <Text style={styles.sectionTitle}>
              Generation:{' '}
              {speciesInfo.generation.replace('generation-', 'Gen ').toUpperCase()}
            </Text>
          )}

          {/* Flavor Text */}
          {speciesInfo?.flavor && (
            <View style={styles.flavorBox}>
              <Text style={styles.flavorTitle}>Pokédex Entry</Text>
              <Text style={styles.flavorText}>{speciesInfo.flavor}</Text>
            </View>
          )}

          {/* Stats */}
        <Text style={styles.sectionTitle}>Stats:</Text>
         <PokemonStats stats={restDetails.stats} />
 

          {/* Evolution Chain */}
          <Text style={styles.sectionTitle}>Evolution Chain:</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginVertical: 15 }}
            contentContainerStyle={{ paddingRight: 20 }}
          >
            {evolutions.map((evo) => {
              const evoSprite = evo.id
                ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${evo.id}.png`
                : null;
              return (
                <TouchableOpacity
                  key={evo.name}
                  onPress={() =>
                    router.push({ pathname: `/pokemon/${evo.name}`, params: { from: from ?? '' } })
                  }
                  style={{ alignItems: 'center', marginRight: 15 }}
                >
                  {evoSprite && (
                    <Image
                      source={{ uri: evoSprite }}
                      style={styles.evoSprite}
                    />
                  )}
                  <Text style={styles.evoName}>{evo.name}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </>
      )}
    </ScrollView>
  );
}

// Shared styles
const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 80, paddingHorizontal: 20, paddingBottom: 40, backgroundColor: '#f0f8ff' },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, paddingHorizontal: 10 },
  backBtn: { padding: 8, borderRadius: 8, backgroundColor: '#ffebcd' },
  favBtn: { padding: 8 },
  title: { fontSize: 32, fontWeight: 'bold', textTransform: 'capitalize', color: '#ff4500', textAlign: 'center', flex: 1 },
  sprite: { width: 180, height: 180, alignSelf: 'center', marginVertical: 20, borderRadius: 90, borderWidth: 3, borderColor: '#ffa500' },
  basicInfo: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 15 },
  bold: { fontWeight: 'bold' },
  sectionTitle: { fontSize: 22, fontWeight: 'bold', marginTop: 15 },
  rowWrap: { flexDirection: 'row', flexWrap: 'wrap', marginVertical: 5 },
  typeBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12, marginRight: 8, marginBottom: 5 },
  abilityBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12, marginRight: 8, marginBottom: 5 },
  typeText: { color: 'white', fontWeight: 'bold', textTransform: 'capitalize' },
  flavorBox: { marginTop: 16, padding: 12, backgroundColor: '#fff7f0', borderRadius: 8 },
  flavorTitle: { fontWeight: '700', marginBottom: 6 },
  flavorText: { fontStyle: 'italic' },
  statText: { fontSize: 16, fontWeight: 'bold', textTransform: 'capitalize' },
  statBar: { height: 12, width: '100%', backgroundColor: '#ddd', borderRadius: 6, overflow: 'hidden' },
  statFill: { height: 12, backgroundColor: '#ff6347', borderRadius: 6 },
  evoSprite: { width: 80, height: 80, borderRadius: 40, borderWidth: 2, borderColor: '#ffa500' },
  evoName: { textTransform: 'capitalize', marginTop: 5, paddingBottom: 50 },
});
