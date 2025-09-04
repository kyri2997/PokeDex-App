import { View, Text, FlatList, Image, TouchableOpacity, TextInput } from 'react-native';
import { useQuery } from '@apollo/client/react';
import { useRouter } from 'expo-router';
import { GET_POKEMONS, GET_TYPES } from '../src/graphql/queries';
import { useState, useEffect } from 'react';
import { getTypeColor } from '../utils/pokemonTypes';
import { Picker } from '@react-native-picker/picker';

export default function Home() {
  const router = useRouter();

  // 🔹 State for search & filters
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [filteredPokemons, setFilteredPokemons] = useState<any[]>([]);

  // 🔹 Fetch Pokémon list
  const { data, loading, error } = useQuery(GET_POKEMONS);

  // 🔹 Fetch Pokémon types for filter dropdown
  const { data: typeData } = useQuery(GET_TYPES);

  // 🔹 Filter Pokémon whenever search or selected type changes
  useEffect(() => {
    if (!data?.pokemon) return;

    let results = data.pokemon;

    // Filter by search query
    if (search) {
      results = results.filter((p: any) =>
        p.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Filter by type
    if (selectedType !== 'all') {
      results = results.filter((p: any) =>
        p.pokemontypes?.some((t: any) => t.type.name === selectedType)
      );
    }

    setFilteredPokemons(results);
  }, [search, selectedType, data]);

  // 🔹 Loading & error states
  if (loading) return <Text>Loading Pokémons...</Text>;
  if (error) return <Text>Error: {error.message}</Text>;

  return (
    <FlatList
      data={filteredPokemons}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={{ padding: 20, paddingBottom: 40, backgroundColor: '#f0f0f0' }}
      // 🔹 Header with search, filters, and title
      ListHeaderComponent={
        <>
          <Text style={styles.title}>Pokédex</Text>

          {/* Search Bar */}
          <TextInput
            placeholder="Search Pokémon..."
            value={search}
            onChangeText={setSearch}
            style={styles.searchBar}
          />

          {/* Type Filter Dropdown */}
          <View style={styles.dropdownContainer}>
            <Picker
              selectedValue={selectedType}
              onValueChange={(itemValue) => setSelectedType(itemValue)}
              
            >
              <Picker.Item label="All types" value="all" />
              {typeData?.type.map((t: any) => (
                <Picker.Item
                  key={t.name}
                  label={capitalize(t.name)}
                  value={t.name}
                  color={getTypeColor(t.name)}
                 style={{ height: 50, width: '50%' }}
                />
              ))}
            </Picker>
          </View>

          {/* Clear filter button */}
          {selectedType !== 'all' && (
            <TouchableOpacity
              onPress={() => setSelectedType('all')}
              style={styles.clearFilterButton}
            >
              <Text style={{ color: '#333', fontWeight: '500' }}>Clear Filter ✕</Text>
            </TouchableOpacity>
          )}
        </>
      }
      // 🔹 Render each Pokémon in a retro card style
      renderItem={({ item }) => {
        const spriteUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${item.id}.png`;
        return (
          <TouchableOpacity onPress={() => router.push(`/pokemon/${item.name}`)}>
            <View style={styles.pokemonCard}>
              <Image source={{ uri: spriteUrl }} style={styles.sprite} />

              <View style={{ flex: 1 }}>
                <Text style={styles.pokemonName}>{item.name}</Text>

                {/* Pokémon types badges */}
                <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
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
                      }}
                    >
                      {t.type.name}
                    </Text>
                  ))}
                </View>
              </View>
            </View>
          </TouchableOpacity>
        );
      }}
    />
  );
}

// 🔹 Helper function to capitalize
function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// 🔹 Styles
const styles = {
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 20,
    paddingTop: 80,
    color: '#ff4500',
    textAlign: 'center',
  },
  searchBar: {
    padding: 15,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  dropdownContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 10,
    backgroundColor: '#fff',
    width: '50%',
    
    // alignSelf: 'center',
  },
  clearFilterButton: {
    alignSelf: 'flex-start',
    marginBottom: 10,
    backgroundColor: '#eee',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  pokemonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    padding: 12,
    marginBottom: 12,
    borderRadius: 16,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  sprite: {
    width: 50,
    height: 50,
    marginRight: 12,
  },
  pokemonName: {
    fontSize: 18,
    fontWeight: 'bold',
    textTransform: 'capitalize',
    marginBottom: 6,
    color: '#ff4500',
  },
};
