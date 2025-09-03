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

  // Fetch Pokémon types
  const { data: typeData } = useQuery(GET_TYPES);


  useEffect(() => {
    if (!data?.pokemon) return;

    let results = data.pokemon;

    // Filter by search
    if (search) {
      results = results.filter((p: any) =>
        p.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Filter by type (requires type info in your data)
    if (selectedType) {
      // This requires you have type info per Pokémon; if not, you’d need to fetch separately
      results = results.filter((p: any) =>
        p.types?.some((t: any) => t.type.name === selectedType)
      );
    }

    setFilteredPokemons(results);
  }, [search, selectedType, data]);
  if (loading) return <Text>Loading Pokémons...</Text>;
  if (error) return <Text>Error: {error.message}</Text>;
  
  return (
    <FlatList
    data={filteredPokemons}
    style={{padding: 20}}
    keyExtractor={(item) => item.id.toString()}
    ListHeaderComponent={
      <>
      {/* Search Bar */}
      <Text style={{ fontSize: 32, fontWeight: 'bold', marginBottom: 20, paddingTop:80 }}>Pokédex</Text>
      <TextInput
        placeholder="Search Pokémon..."
        value={search}
        onChangeText={setSearch}
        style={{
          padding: 10,
          borderWidth: 1,
          borderColor: '#ccc',
          borderRadius: 8,
          marginBottom: 15,
          marginTop: 20, // top spacing
        }}
      />

      {/* Type Filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
        {typeData?.type.map((t: any) => (
          <TouchableOpacity
            key={t.name}
            onPress={() => setSelectedType(selectedType === t.name ? null : t.name)}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 12,
              marginRight: 8,
              backgroundColor: selectedType === t.name ? getTypeColor(t.name) : '#eee',
            }}
          >
            <Text
              style={{
                textTransform: 'capitalize',
                color: selectedType === t.name ? 'white' : 'black',
              }}
            >
              {t.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </>
  }
  renderItem={({ item }) => {
    const spriteUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${item.id}.png`;
    return (
      <TouchableOpacity onPress={() => router.push(`/pokemon/${item.name}`)}>
        <View style={{ flexDirection: 'row', padding: 10, alignItems: 'center' }}>
          <Image source={{ uri: spriteUrl }} style={{ width: 50, height: 50, marginRight: 10 }} />
          <Text style={{ fontSize: 18, textTransform: 'capitalize' }}>{item.name}</Text>
        </View>
      </TouchableOpacity>
    );
  }}
/>

  );
}

