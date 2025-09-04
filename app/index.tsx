import { ActivityIndicator, StyleSheet, View, Text, FlatList, Image, TouchableOpacity, TextInput } from 'react-native';
import { useQuery } from '@apollo/client/react';
import { useRouter } from 'expo-router';
import { GET_POKEMONS, GET_TYPES } from '../src/graphql/queries';
import { useState, useEffect } from 'react';
import { getTypeColor } from '../utils/pokemonTypes';
import { Picker } from '@react-native-picker/picker';
import { Pokemon, Type } from '../src/types/pokemon';
import { useFavourites } from '../context/FavouritesContext';
import { Ionicons } from '@expo/vector-icons';


export default function Home() {
  const router = useRouter();

  // 🔹 State for search & filters
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [filteredPokemons, setFilteredPokemons] = useState<Pokemon[]>([]);
  const { addFavourite, removeFavourite, isFavourite } = useFavourites();


  // 🔹 Fetch Pokémon list
const { data } = useQuery<{ pokemon: Pokemon[] }>(GET_POKEMONS);
const { loading, error } = useQuery(GET_POKEMONS);
  // 🔹 Fetch Pokémon types for filter dropdown
const { data: typeData } = useQuery<{ type: Type[] }>(GET_TYPES);

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
if (loading)
  return (
    <View style={styles.statusContainer}>
      <ActivityIndicator size="large" color="#fff" />
      <Text style={styles.statusText}>Loading Pokédex...</Text>
    </View>
  );

if (error)
  return (
    <View style={styles.statusContainer}>
      <Text style={styles.statusText}>⚠️ Error: {error.message}</Text>
    </View>
  );

  return (
      <View style={{ flex: 1, backgroundColor: '#ff4500' }}>

    <FlatList
      data={filteredPokemons}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
      // 🔹 Header with search, filters, and title
      ListHeaderComponent={
        <>
             <Image
              source={require('../assets/pokedex.png')}
              style={{ width: 100 , height: 100, justifyContent: 'center', alignSelf: 'center', marginTop: 50 }}
              resizeMode="contain"
            />
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
        {/* Sprite */}
        <Image source={{ uri: spriteUrl }} style={styles.sprite} />

        {/* Name + Types */}
        <View style={styles.pokemonInfo}>
          <Text style={styles.pokemonName}>{item.name}</Text>

          <View style={styles.typeContainer}>
            {item.pokemontypes?.map((t: any) => (
              <Text
                key={t.type.name}
                style={[styles.typeBadge, { backgroundColor: getTypeColor(t.type.name) }]}
              >
                {capitalize(t.type.name)}
              </Text>
            ))}
          </View>
        </View>

        {/* Favourite Star */}
        <TouchableOpacity
          onPress={() =>
            isFavourite(item.name)
              ? removeFavourite(item.name)
              : addFavourite({ id: item.id, name: item.name })
          }
          style={styles.favouriteButton}
        >
          <Ionicons
            name={isFavourite(item.name) ? 'star' : 'star-outline'}
            size={28}
            color="#ffd700"
          />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}}

    />
      </View>
  );
}

// 🔹 Helper function to capitalize
function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// 🔹 Styles
const styles = StyleSheet.create({
    statusContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ff4500', // matches app background
    padding: 20,
  },
  statusText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 12,
    textAlign: 'center',
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    marginBottom: 30,
    // paddingTop: 60,
    color: 'white',
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
    width: '100%',
    
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
    color: 'black',
  },
  pokemonInfo: {
  flex: 1,
  flexDirection: 'column',
},

typeContainer: {
  flexDirection: 'row',
  flexWrap: 'wrap',
},

typeBadge: {
  fontSize: 14,
  color: 'white',
  paddingHorizontal: 6,
  paddingVertical: 2,
  borderRadius: 6,
  marginRight: 4,
  marginBottom: 2,
},

favouriteButton: {
  paddingLeft: 10,
  justifyContent: 'center',
  alignItems: 'center',
},


});
