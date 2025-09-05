// app/index.tsx
import React, { useRef, useMemo, useState, useCallback } from 'react';
import { View, Text, FlatList, TextInput, StyleSheet, ActivityIndicator, TouchableOpacity, Image } from 'react-native';
import { useQuery } from '@apollo/client/react';
import { GET_POKEMONS, GET_TYPES } from '../src/graphql/queries';
import { Pokemon } from '../src/types/pokemon';
import { PokemonCard } from '../src/components/PokemonCard';
import { Picker } from '@react-native-picker/picker';

export default function Home() {
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const { data, loading, error } = useQuery<{ pokemon: Pokemon[] }>(GET_POKEMONS);
  const { data: typesData } = useQuery<{ type: { name: string }[] }>(GET_TYPES);

  const filteredTypes =
    typesData?.type.filter(
      (t: { name: string }) =>
        t.name !== 'stellar' && t.name !== 'shadow' && t.name !== 'unknown'
    ) ?? [];

  const listRef = useRef<FlatList<Pokemon>>(null);

  // Declarative filtering with useMemo
  const filtered = useMemo(() => {
    const all = data?.pokemon ?? [];
    const bySearch = search
      ? all.filter((p) =>
          p.name.toLowerCase().includes(search.toLowerCase())
        )
      : all;

    if (listRef.current) {
      listRef.current.scrollToOffset({ offset: 0, animated: true });
    }

    if (selectedType && selectedType !== 'all') {
      return bySearch.filter((p) =>
        p.pokemontypes?.some((t) => t.type.name === selectedType)
      );
    }
    return bySearch;
  }, [data, search, selectedType]);

  const renderItem = useCallback(
    ({ item }: { item: Pokemon }) => <PokemonCard item={item} />,
    []
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={styles.loadingText}>Loading Pokédex...</Text>
      </View>
    );
  }

  if (error)
    return (
      <View style={styles.center}>
        <Text style={styles.loadingText}>Error: {error.message}</Text>
      </View>
    );

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/pokedex.png')}
        style={styles.logo}
      />
      <Image
        source={require('../assets/pokedex-header.png')}
        style={styles.title}
      />
      {/* <Text style={styles.title}>Pokédex</Text> */}

      <TextInput
        placeholder="Search Pokémon..."
        value={search}
        onChangeText={setSearch}
        style={styles.search}
        returnKeyType="search"
      />

      <View style={styles.filtersRow}>
        <View style={styles.dropdown}>
          <Picker
            selectedValue={selectedType ?? 'all'}
            onValueChange={(v) => setSelectedType(v)}
          >
            <Picker.Item label="All types" value="all" />
            {filteredTypes.map((t) => (
              <Picker.Item key={t.name} label={t.name} value={t.name} />
            ))}
          </Picker>
        </View>

        {selectedType && selectedType !== 'all' && (
          <TouchableOpacity
            style={styles.clearFilterButton}
            onPress={() => setSelectedType(null)}
          >
            <Text style={styles.clearFilterText}>Clear Filter</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        ref={listRef}
        data={filtered}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ padding: 20 }}
        initialNumToRender={12}
        windowSize={10}
        removeClippedSubviews
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ff4500' },
  logo: {
    width: 120,
    height: 100,
    alignSelf: 'center',
    marginTop: 25,
    // marginBottom: 10,
    // contain
    resizeMode: 'contain',
  },
  title: {
    // fontSize: 32,
    // fontWeight: 'bold',
    // color: '#fff',
    // marginTop: 60,
    marginBottom: 10,
    width: 320,
    height: 80,
    alignSelf: 'center',
    resizeMode: 'contain',

  },
  search: {
    marginLeft: 20,
    marginRight: 20,
    marginBottom:10,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  filtersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  dropdown: {
    flex: 1,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  clearFilterButton: {
    marginLeft: 10,
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  clearFilterText: {
    color: '#ff4500',
    fontWeight: '600',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ff4500',
  },
  loadingText: { color: '#fff', marginTop: 12, fontWeight: '700' },
});
