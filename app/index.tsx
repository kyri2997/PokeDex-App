import { View, Text, FlatList, Image, TouchableOpacity, TextInput } from 'react-native';
import { useQuery } from '@apollo/client/react';
import { useRouter } from 'expo-router';
import { GET_POKEMONS, GET_TYPES } from '../src/graphql/queries';
import { useState, useEffect } from 'react';
import { getTypeColor } from '../utils/pokemonTypes';
import { Picker } from '@react-native-picker/picker';

export default function Home() {
  const router = useRouter();

  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [filteredPokemons, setFilteredPokemons] = useState<any[]>([]);

  // Fetch Pokémon list
  const { data, loading, error } = useQuery(GET_POKEMONS);

  // Fetch all types for dropdown
  const { data: typeData } = useQuery(GET_TYPES);

  // Filter Pokémon by search & type
  useEffect(() => {
    if (!data?.pokemon) return;

    let results = data.pokemon;

    // 1️⃣ Filter by search text
    if (search) {
      results = results.filter((p: any) =>
        p.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    // 2️⃣ Filter by selected type
    if (selectedType && selectedType !== 'all') {
      results = results.filter((p: any) =>
        // Replace `types` with your actual field from GET_POKEMONS
        p.pokemontypes?.some((t: any) => t.type.name === selectedType)
      );
    }

    setFilteredPokemons(results);
  }, [search, selectedType, data]);

  if (loading) return <Text>Loading Pokémons...</Text>;
  if (error) return <Text>Error: {error.message}</Text>;

  return (
    <FlatList
      data={filteredPokemons}
      style={{ padding: 20 }}
      keyExtractor={(item) => item.id.toString()}
      ListHeaderComponent={
        <>
          <Text style={{ fontSize: 32, fontWeight: 'bold', marginBottom: 20, paddingTop: 80 }}>
            Pokédex
          </Text>

          {/* Search Bar */}
          <TextInput
            placeholder="Search Pokémon..."
            value={search}
            onChangeText={setSearch}
            style={{
              padding: 10,
              borderWidth: 1,
              borderColor: '#ccc',
              borderRadius: 8,
              marginBottom: 10,
            }}
          />

          {/* Type Dropdown */}
          <View
            style={{
              borderWidth: 1,
              borderColor: '#ccc',
              borderRadius: 8,
              overflow: 'hidden',
              marginBottom: 20,
            }}
          >
            <Picker
              selectedValue={selectedType}
              onValueChange={(itemValue) => setSelectedType(itemValue)}
            >
              <Picker.Item label="All types" value="all" />
              {typeData?.type.map((t: any) => (
                <Picker.Item
                  key={t.name}
                  label={t.name.charAt(0).toUpperCase() + t.name.slice(1)}
                  value={t.name}
                />
              ))}
            </Picker>
          </View>
        </>
      }
      renderItem={({ item }) => {
        const spriteUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${item.id}.png`;

        return (
          <TouchableOpacity onPress={() => router.push(`/pokemon/${item.name}`)}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                flexWrap: 'wrap',
                paddingVertical: 10,
              }}
            >
              <Image
                source={{ uri: spriteUrl }}
                style={{ width: 50, height: 50, marginRight: 10 }}
              />
              <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
                <Text style={{ fontSize: 18, textTransform: 'capitalize', marginRight: 8 }}>
                  {item.name}
                </Text>
                {item.pokemontypes?.map((t: any) => (
                  <Text
                    key={t.type.name}
                    style={{
                      fontSize: 14,
                      textTransform: 'capitalize',
                      backgroundColor: getTypeColor(t.type.name),
                      color: 'white',
                      paddingHorizontal: 6,
                      paddingVertical: 2,
                      borderRadius: 6,
                      marginRight: 4,
                      marginBottom: 2,
                      marginLeft: 10,
                    }}
                  >
                    {t.type.name}
                  </Text>
                ))}
              </View>
            </View>
          </TouchableOpacity>
        );
      }}
    />
  );
}
