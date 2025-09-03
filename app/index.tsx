// import React from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { useQuery} from '@apollo/client/react';
import { useRouter } from 'expo-router';
import { GET_POKEMONS, GET_TYPES } from '../src/graphql/queries';
import { useState, useEffect } from 'react';

export default function Home() {
  const router = useRouter();

  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [filteredPokemons, setFilteredPokemons] = useState<any[]>([]);

  const { data, loading, error } = useQuery(GET_POKEMONS);

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
