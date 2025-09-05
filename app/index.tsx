// app/index.tsx
import React, { useMemo, useState, useCallback } from 'react';
import { View, Text, FlatList, TextInput, StyleSheet, ActivityIndicator } from 'react-native';
import { useQuery } from '@apollo/client/react';
import { GET_POKEMONS, GET_TYPES } from '../src/graphql/queries';
import { Pokemon } from '../src/types/pokemon';
import { PokemonCard } from '../src/components/PokemonCard';
import { Picker } from '@react-native-picker/picker';

export default function Home() {
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');

  const { data, loading, error } = useQuery<{ pokemon: Pokemon[] }>(GET_POKEMONS);
  const { data: typesData } = useQuery<{ type: { name: string }[] }>(GET_TYPES);

  // Declarative filtering with useMemo 
  const filtered = useMemo(() => {
    const all = data?.pokemon ?? [];
    const bySearch = search ? all.filter(p => p.name.toLowerCase().includes(search.toLowerCase())) : all;

    if (selectedType && selectedType !== 'all') {
      return bySearch.filter(p => p.pokemontypes?.some(t => t.type.name === selectedType));
    }
    return bySearch;
  }, [data, search, selectedType]);

  const renderItem = useCallback(({ item }: { item: Pokemon }) => <PokemonCard item={item} />, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={styles.loadingText}>Loading Pokédex...</Text>
      </View>
    );
  }
  if (error) return <View style={styles.center}><Text style={styles.loadingText}>Error: {error.message}</Text></View>;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pokédex</Text>

      <TextInput
        placeholder="Search Pokémon..."
        value={search}
        onChangeText={setSearch}
        style={styles.search}
        returnKeyType="search"
      />

      <View style={styles.filtersRow}>
        <View style={styles.dropdown}>
          <Picker selectedValue={selectedType} onValueChange={(v) => setSelectedType(v)}>
            <Picker.Item label="All types" value="all" />
            {typesData?.type.map(t => <Picker.Item key={t.name} label={t.name} value={t.name} />)}
          </Picker>
        </View>
      </View>

      <FlatList
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
  title: { fontSize: 32, fontWeight: 'bold', color: '#fff', marginTop: 60, marginLeft: 20, marginBottom: 10 },
  search: { margin: 20, padding: 12, borderRadius: 8, backgroundColor: '#fff' },
  filtersRow: { flexDirection: 'row', paddingHorizontal: 20 },
  dropdown: { flex: 1, borderRadius: 8, overflow: 'hidden', backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#ff4500' },
  loadingText: { color: '#fff', marginTop: 12, fontWeight: '700' },
});
