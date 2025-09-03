import { View, Text, Image, ScrollView } from 'react-native';
import { useQuery } from '@apollo/client/react';
import { gql } from '@apollo/client';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

const GET_POKEMON_BASIC = gql`
  query getPokemon($name: String!) {
    pokemon(where: { name: { _eq: $name } }) {
      id
      name
      height
      weight
    }
  }
`;

// Map type to colors
const getTypeColor = (type: string) => {
  switch (type.toLowerCase()) {
    case 'fire': return '#f08030';
    case 'water': return '#6890f0';
    case 'grass': return '#78c850';
    case 'electric': return '#f8d030';
    case 'psychic': return '#f85888';
    case 'ice': return '#98d8d8';
    case 'dragon': return '#7038f8';
    case 'dark': return '#705848';
    case 'fairy': return '#ee99ac';
    case 'normal': return '#a8a878';
    default: return '#a8a8a8';
  }
};

// Get Pokémon ID from name in evolution chain


// Example placeholder map
const nameToIdMap: Record<string, number> = {}; // fill dynamically if needed


export default function PokemonDetails() {
  const { name } = useLocalSearchParams<{ name: string }>();
  const pokemonName = Array.isArray(name) ? name[0] : name ?? '';
    const router = useRouter();

  const { loading, error, data } = useQuery(GET_POKEMON_BASIC, {
    variables: { name: pokemonName.toLowerCase() },
  });

  const [restDetails, setRestDetails] = useState<any>(null);
  const [evolutions, setEvolutions] = useState<string[]>([]);
useEffect(() => {
  if (!pokemonName) return; // nothing to fetch

  let isCancelled = false; // prevent setting state after unmount

  const fetchDetails = async () => {
    try {
      // 1️⃣ Fetch main Pokémon REST data
      const resPokemon = await fetch(
        `https://pokeapi.co/api/v2/pokemon/${pokemonName.toLowerCase()}`
      );
      if (!resPokemon.ok) throw new Error('Failed to fetch Pokémon data');
      const pokemonJson = await resPokemon.json();
      if (!isCancelled) setRestDetails(pokemonJson);

      // 2️⃣ Fetch species to get evolution chain URL
      const resSpecies = await fetch(pokemonJson.species.url);
      if (!resSpecies.ok) throw new Error('Failed to fetch species data');
      const speciesJson = await resSpecies.json();

      // 3️⃣ Fetch evolution chain
      const resEvolution = await fetch(speciesJson.evolution_chain.url);
      if (!resEvolution.ok) throw new Error('Failed to fetch evolution chain');
      const evolutionJson = await resEvolution.json();

      // 4️⃣ Flatten evolution chain recursively (handles branching)
      const evoNames: string[] = [];
      const traverseChain = (node: any) => {
        if (!node) return;
        evoNames.push(node.species.name);
        if (node.evolves_to?.length > 0) {
          node.evolves_to.forEach(traverseChain);
        }
      };
      traverseChain(evolutionJson.chain);

      // 5️⃣ Fetch IDs for sprites
      const evoWithIds = await Promise.all(
        evoNames.map(async (evoName) => {
          try {
            const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${evoName}`);
            if (!res.ok) throw new Error('Pokémon not found');
            const json = await res.json();
            return { name: evoName, id: json.id };
          } catch {
            return { name: evoName, id: 0 }; // fallback for missing
          }
        })
      );

      if (!isCancelled) setEvolutions(evoWithIds.filter((e) => e.id > 0)); // only valid IDs
    } catch (err) {
      console.error('Error fetching Pokémon details:', err);
    }
  };

  fetchDetails();

  return () => {
    isCancelled = true;
  };
}, [pokemonName]);


  if (loading) return <Text>Loading basic info...</Text>;
  if (error) return <Text>Error: {error.message}</Text>;

  const pokemon = data.pokemon[0];
  const spriteUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`;

  return (
  <ScrollView
  style={{ paddingTop: 80, paddingHorizontal: 20, paddingBottom: 40, backgroundColor: '#f0f8ff' }}
  contentContainerStyle={{ paddingBottom: 60 }} // ensures you can scroll to bottom
>
  {/* Pokémon Name */}
  <Text
    style={{
      fontSize: 32,
      fontWeight: 'bold',
      textTransform: 'capitalize',
      textAlign: 'center',
      color: '#ff4500',
      marginBottom: 20,
    }}
  >
    {pokemon.name}
  </Text>

  {/* Sprite */}
  <Image
    source={{ uri: spriteUrl }}
    style={{
      width: 180,
      height: 180,
      alignSelf: 'center',
      marginVertical: 20,
      borderRadius: 90,
      borderWidth: 3,
      borderColor: '#ffa500',
    }}
  />

  {/* Basic Info */}
  <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 15 }}>
    <Text style={{ fontSize: 18 }}>ID: {pokemon.id}</Text>
    <Text style={{ fontSize: 18 }}>Height: {pokemon.height}</Text>
    <Text style={{ fontSize: 18 }}>Weight: {pokemon.weight}</Text>
  </View>

  {restDetails && (
    <>
      {/* Types */}
      <Text style={{ fontSize: 22, fontWeight: 'bold', marginTop: 15 }}>Types:</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginVertical: 5 }}>
        {restDetails.types.map((t: any) => (
          <View
            key={t.slot}
            style={{
              backgroundColor: getTypeColor(t.type.name),
              paddingHorizontal: 10,
              paddingVertical: 5,
              borderRadius: 12,
              marginRight: 8,
              marginBottom: 5,
            }}
          >
            <Text style={{ color: 'white', fontWeight: 'bold', textTransform: 'capitalize' }}>
              {t.type.name}
            </Text>
          </View>
        ))}
      </View>

      {/* Abilities */}
      <Text style={{ fontSize: 22, fontWeight: 'bold', marginTop: 15 }}>Abilities:</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginVertical: 5 }}>
        {restDetails.abilities.map((a: any) => (
          <View
            key={a.ability.name}
            style={{
              backgroundColor: a.is_hidden ? '#6a5acd' : '#20b2aa',
              paddingHorizontal: 10,
              paddingVertical: 5,
              borderRadius: 12,
              marginRight: 8,
              marginBottom: 5,
            }}
          >
            <Text style={{ color: 'white', fontWeight: 'bold', textTransform: 'capitalize' }}>
              {a.ability.name}
              {a.is_hidden ? ' (Hidden)' : ''}
            </Text>
          </View>
        ))}
      </View>

      {/* Stats */}
      <Text style={{ fontSize: 22, fontWeight: 'bold', marginTop: 15 }}>Stats:</Text>
      <View style={{ marginVertical: 5 }}>
        {restDetails.stats.map((s: any) => (
          <View key={s.stat.name} style={{ marginBottom: 8 }}>
            <Text style={{ fontSize: 16, fontWeight: 'bold', textTransform: 'capitalize' }}>
              {s.stat.name}: {s.base_stat}
            </Text>
            <View
              style={{
                height: 12,
                width: '100%',
                backgroundColor: '#ddd',
                borderRadius: 6,
                overflow: 'hidden',
              }}
            >
              <View
                style={{
                  height: 12,
                  width: `${(s.base_stat / 255) * 100}%`,
                  backgroundColor: '#ff6347',
                  borderRadius: 6,
                }}
              />
            </View>
          </View>
        ))}
      </View>

      {/* Evolution Chain with Sprites */}
      <Text style={{ fontSize: 22, fontWeight: 'bold', marginTop: 15 }}>Evolution Chain:</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginVertical: 15 }}
        contentContainerStyle={{ paddingRight: 20 }}
      >
        {evolutions.map((evo: any) => {
          // Construct sprite URL dynamically from Pokémon ID
          const evoSprite = evo.id
            ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${evo.id}.png`
            : null;

          return (
            <TouchableOpacity
              key={evo.name}
              onPress={() => router.push(`/pokemon/${evo.name}`)}
              style={{ alignItems: 'center', marginRight: 15 }}
            >
              {evoSprite && (
                <Image
                  source={{ uri: evoSprite }}
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: 40,
                    borderWidth: 2,
                    borderColor: '#ffa500',
                  }}
                />
              )}
              <Text style={{ textTransform: 'capitalize', marginTop: 5, paddingBottom:50 }}>{evo.name}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </>
  )}
</ScrollView>

);

}
