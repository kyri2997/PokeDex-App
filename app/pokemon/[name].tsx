import { View, Text, Image, ScrollView } from 'react-native';
import { useQuery } from '@apollo/client/react';
import { gql } from '@apollo/client';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';

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
    <ScrollView style={{ padding: 20 }}>
      <Text style={{ fontSize: 28, fontWeight: 'bold', textTransform: 'capitalize' }}>
        {pokemon.name}
      </Text>
      <Image source={{ uri: spriteUrl }} style={{ width: 150, height: 150, marginVertical: 20 }} />

      <Text style={{ fontSize: 18 }}>ID: {pokemon.id}</Text>
      <Text style={{ fontSize: 18 }}>Height: {pokemon.height}</Text>
      <Text style={{ fontSize: 18 }}>Weight: {pokemon.weight}</Text>

      {restDetails && (
        <>
          {/* Types */}
          <Text style={{ fontSize: 20, marginTop: 10, fontWeight: 'bold' }}>Types:</Text>
          {restDetails.types.map((t: any) => (
            <Text key={t.slot} style={{ fontSize: 18, textTransform: 'capitalize' }}>
              {t.type.name}
            </Text>
          ))}

          {/* Abilities */}
          <Text style={{ fontSize: 20, marginTop: 10, fontWeight: 'bold' }}>Abilities:</Text>
          {restDetails.abilities.map((a: any) => (
            <Text key={a.ability.name} style={{ fontSize: 18, textTransform: 'capitalize' }}>
              {a.ability.name}{a.is_hidden ? ' (Hidden)' : ''}
            </Text>
          ))}

          {/* Stats */}
          <Text style={{ fontSize: 20, marginTop: 10, fontWeight: 'bold' }}>Stats:</Text>
          {restDetails.stats.map((s: any) => (
            <Text key={s.stat.name} style={{ fontSize: 18, textTransform: 'capitalize' }}>
              {s.stat.name}: {s.base_stat}
            </Text>
          ))}

          {/* Evolutions */}
          <Text style={{ fontSize: 20, marginTop: 10, fontWeight: 'bold' }}>Evolution Chain:</Text>
          {evolutions.map((evo) => (
            <Text key={evo} style={{ fontSize: 18, textTransform: 'capitalize' }}>
              {evo}
            </Text>
          ))}
        </>
      )}
    </ScrollView>
  );
}
