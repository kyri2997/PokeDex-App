// import React from 'react';
import { View, Text, FlatList, Image, TouchableOpacity } from 'react-native';
import { useQuery} from '@apollo/client/react';
import { gql} from '@apollo/client';
import { useRouter } from 'expo-router';
import { GET_POKEMONS } from '../src/graphql/queries';
// import { GET_POKEMON_BASIC } from '../src/graphql/queries';

export default function Home() {
  const router = useRouter();

  const { data, loading, error } = useQuery(GET_POKEMONS);
  //Pseudo: fetch first 20 Pokémon using Apollo useQuery

  if (loading) return <Text>Loading...</Text>;
  if (error) return <Text>Error: {error.message}</Text>;

    return (
    <FlatList
      data={data.pokemon}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => {
        // Build REST API URL for sprite
        const spriteUrl = `https://pokeapi.co/api/v2/pokemon/${item.name.toLowerCase()}/`;

        return (
          <TouchableOpacity onPress={() => router.push(`/pokemon/${item.name}`)}>
            <View style={{ flexDirection: 'row', padding: 10, alignItems: 'center'}}>
              {/* Image component fetches directly from REST endpoint JSON */}
              <Image
                source={{ uri: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${item.id}.png` }}
                style={{ width: 50, height: 50, marginRight: 10 }}
              />
              <Text style={{ fontSize: 18, textTransform: 'capitalize' }}>{item.name}</Text>
            </View>
          </TouchableOpacity>
        );
      }}
    />
  );
}
