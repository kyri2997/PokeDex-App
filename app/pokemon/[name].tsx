import { View, Text, Image, ScrollView } from 'react-native';
import { useQuery } from '@apollo/client/react';
import { gql } from '@apollo/client';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { TouchableOpacity } from 'react-native';

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
// This assumes you have restDetails or can compute IDs; you may adjust if you store IDs
const getPokemonId = (name: string) => {
  // Simple mock: could map from restDetails or fetch from API
  return nameToIdMap[name] || 0;
};

// Example placeholder map
const nameToIdMap: Record<string, number> = {}; // fill dynamically if needed


export default function PokemonDetails() {
  const { name } = useLocalSearchParams<{ name: string }>();
  const pokemonName = Array.isArray(name) ? name[0] : name ?? '';

  const { loading, error, data } = useQuery(GET_POKEMON_BASIC, {
    variables: { name: pokemonName.toLowerCase() },
  });

  const [restDetails, setRestDetails] = useState<any>(null);
  const [evolutions, setEvolutions] = useState<string[]>([]);

  useEffect(() => {
    if (!pokemonName) return;

    // Step 1: fetch basic Pokémon details (REST)
    fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName.toLowerCase()}`)
      .then((res) => res.json())
      .then((json) => {
        setRestDetails(json);

        // Step 2: fetch species for evolution chain
        return fetch(json.species.url);
      })
      .then((res) => res.json())
      .then((speciesData) => {
        // Step 3: fetch evolution chain
        return fetch(speciesData.evolution_chain.url);
      })
      .then((res) => res.json())
      .then((evolutionData) => {
        // Parse evolution chain recursively
        const evoNames: string[] = [];
        let current = evolutionData.chain;

        while (current) {
          evoNames.push(current.species.name);
          if (current.evolves_to.length > 0) {
            current = current.evolves_to[0];
          } else {
            current = null;
          }
        }

        setEvolutions(evoNames);
      })
      .catch((err) => console.error(err));
  }, [pokemonName]);

  if (loading) return <Text>Loading basic info...</Text>;
  if (error) return <Text>Error: {error.message}</Text>;

  const pokemon = data.pokemon[0];
  const spriteUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`;

  return (
  <ScrollView style={{ padding: 20, backgroundColor: '#f0f8ff' }}>
    {/* Pokémon Name */}
    <Text
      style={{
        fontSize: 32,
        fontWeight: 'bold',
        textTransform: 'capitalize',
        textAlign: 'center',
        color: '#ff4500',
        marginBottom: 10,
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
                {a.ability.name}{a.is_hidden ? ' (Hidden)' : ''}
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

        {/* Evolution Chain */}
        <Text style={{ fontSize: 22, fontWeight: 'bold', marginTop: 15 }}>Evolution Chain:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 10 }}>
          {evolutions.map((evo) => {
            const evoSprite = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${getPokemonId(evo)}.png`;
            return (
              <TouchableOpacity
                key={evo}
                onPress={() => router.push(`/pokemon/${evo}`)}
                style={{ alignItems: 'center', marginRight: 15 }}
              >
                <Image
                  source={{ uri: evoSprite }}
                  style={{ width: 80, height: 80, borderRadius: 40, borderWidth: 2, borderColor: '#ffa500' }}
                />
                <Text style={{ textTransform: 'capitalize', marginTop: 5 }}>{evo}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </>
    )}
  </ScrollView>
);

}
