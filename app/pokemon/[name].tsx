import { View, Text, Image, ScrollView, TouchableOpacity }from 'react-native';
import { useQuery } from '@apollo/client/react';
import { gql } from '@apollo/client';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { getTypeColor } from '../../utils/pokemonTypes';
import { useFavourites } from "../../context/FavouritesContext";
import { Ionicons } from "@expo/vector-icons";


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

// Get Pokémon ID from name in evolution chain


// Example placeholder map
const nameToIdMap: Record<string, number> = {}; // fill dynamically if needed


export default function PokemonDetails() {
  const { name } = useLocalSearchParams<{ name: string }>();
  const pokemonName = Array.isArray(name) ? name[0] : name ?? '';
    const router = useRouter();

  const { loading, error, data } = useQuery(GET_POKEMON_BASIC, {
    variables: { name: pokemonName.toLowerCase() },
  });

  const [restDetails, setRestDetails] = useState<any>(null);
  const [evolutions, setEvolutions] = useState<string[]>([]);
  const [speciesInfo, setSpeciesInfo] = useState<{ flavor: string; generation?: string } | null>(
    null
  );
  const { addFavourite, removeFavourite, isFavourite } = useFavourites();


useEffect(() => {
  if (!pokemonName) return; // nothing to fetch

  let isCancelled = false; // prevent setting state after unmount
  

  const fetchDetails = async () => {
    try {
      // 1️⃣ Fetch main Pokémon REST data
      const resPokemon = await fetch(
        `https://pokeapi.co/api/v2/pokemon/${pokemonName.toLowerCase()}`
      );
      if (!resPokemon.ok) throw new Error('Failed to fetch Pokémon data');
      const pokemonJson = await resPokemon.json();
      if (!isCancelled) setRestDetails(pokemonJson);

      // 2️⃣ Fetch species to get evolution chain URL
      const resSpecies = await fetch(pokemonJson.species.url);
      if (!resSpecies.ok) throw new Error('Failed to fetch species data');
      const speciesJson = await resSpecies.json();

      // Flavour text
      const flavorEntry = speciesJson.flavor_text_entries.find(
            (entry: any) => entry.language.name === "en"
            );
            const flavor = flavorEntry
            ? flavorEntry.flavor_text.replace(/\n|\f/g, " ")
            : "No flavor text available.";

            const generation = speciesJson.generation?.name;
            setSpeciesInfo({ flavor, generation });

      // 3️⃣ Fetch evolution chain
      const resEvolution = await fetch(speciesJson.evolution_chain.url);
      if (!resEvolution.ok) throw new Error('Failed to fetch evolution chain');
      const evolutionJson = await resEvolution.json();

      // 4️⃣ Flatten evolution chain recursively (handles branching)
      const evoNames: string[] = [];
      const traverseChain = (node: any) => {
        if (!node) return;
        evoNames.push(node.species.name);
        if (node.evolves_to?.length > 0) {
          node.evolves_to.forEach(traverseChain);
        }
      };
      traverseChain(evolutionJson.chain);

      // 5️⃣ Fetch IDs for sprites
      const evoWithIds = await Promise.all(
        evoNames.map(async (evoName) => {
          try {
            const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${evoName}`);
            if (!res.ok) throw new Error('Pokémon not found');
            const json = await res.json();
            return { name: evoName, id: json.id };
          } catch {
            return { name: evoName, id: 0 }; // fallback for missing
          }
        })
      );

      if (!isCancelled) setEvolutions(evoWithIds.filter((e) => e.id > 0)); // only valid IDs
    } catch (err) {
      console.error('Error fetching Pokémon details:', err);
    }
  };

  fetchDetails();

  return () => {
    isCancelled = true;
  };
}, [pokemonName]);


  if (loading) return <Text>Loading basic info...</Text>;
  if (error) return <Text>Error: {error.message}</Text>;

  const pokemon = data.pokemon[0];
  const spriteUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`;

  return (

    <ScrollView
        style={{ paddingTop: 80, paddingHorizontal: 20, paddingBottom: 40, backgroundColor: '#f0f8ff' }}
        contentContainerStyle={{ paddingBottom: 60 }} // ensures you can scroll to bottom
    >
    {/* Back button and Name Row */}
    {/* Header Row: Back, Name, Favourite */}
<View
  style={{
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingHorizontal: 10,
  }}
>
  {/* Back Button */}
  <TouchableOpacity
    onPress={() => router.back()}
    style={{
      padding: 8,
      borderRadius: 8,
      backgroundColor: '#ffebcd',
    }}
  >
    <Ionicons name="arrow-back" size={24} color="#ff4500" />
  </TouchableOpacity>

  {/* Pokémon Name */}
  <Text
    style={{
      fontSize: 32,
      fontWeight: 'bold',
      textTransform: 'capitalize',
      color: '#ff4500',
      textAlign: 'center',
      flex: 1,
    }}
    numberOfLines={1} // optional: keep it on a single line
  >
    {pokemon.name}
  </Text>

  {/* Favourite Button */}
  <TouchableOpacity
    onPress={() =>
      isFavourite(pokemon.name)
        ? removeFavourite(pokemon.name)
        : addFavourite({ id: pokemon.id, name: pokemon.name })
    }
    style={{ padding: 8 }}
  >
    <Ionicons
      name={isFavourite(pokemon.name) ? 'star' : 'star-outline'}
      size={32}
      color="#ffd700"
    />
  </TouchableOpacity>
</View>



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
    <Text style={{ fontSize: 18}}>
        <Text style={{ fontWeight: 'bold' }}>ID: </Text>{pokemon.id}
    </Text>
    <Text style={{ fontSize: 18}}>
        <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Height: </Text>{pokemon.height/10}m
    </Text>
    <Text style={{ fontSize: 18}}>
        <Text style={{ fontWeight: 'bold' }}>Weight: </Text>{pokemon.weight/10}kg
    </Text>
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
              {a.ability.name}
              {a.is_hidden ? ' (Hidden)' : ''}
            </Text>
          </View>
        ))}
      </View>
      
      {/* Generation */}
        {speciesInfo?.generation && (
        <Text style={{  marginTop: 15, fontSize: 22}}>
            <Text style={{  fontWeight: 'bold'  }}>Generation: </Text>
            {speciesInfo.generation.replace("generation-", "Gen ").toUpperCase()}
        </Text>
        )}
    {/* Pokédex flavor text */}
        {speciesInfo?.flavor && (
        <View style={{ marginTop: 16, padding: 12, backgroundColor: "#fff7f0", borderRadius: 8 }}>
            <Text style={{ fontWeight: "700", marginBottom: 6 }}>Pokédex Entry</Text>
            <Text style={{ fontStyle: "italic" }}>{speciesInfo.flavor}</Text>
        </View>
        )}

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

      {/* Evolution Chain with Sprites */}
      <Text style={{ fontSize: 22, fontWeight: 'bold', marginTop: 15 }}>Evolution Chain:</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginVertical: 15 }}
        contentContainerStyle={{ paddingRight: 20 }}
      >
        {evolutions.map((evo: any) => {
          // Construct sprite URL dynamically from Pokémon ID
          const evoSprite = evo.id
            ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${evo.id}.png`
            : null;

          return (
            <TouchableOpacity
              key={evo.name}
              onPress={() => router.push(`/pokemon/${evo.name}`)}
              style={{ alignItems: 'center', marginRight: 15 }}
            >
              {evoSprite && (
                <Image
                  source={{ uri: evoSprite }}
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: 40,
                    borderWidth: 2,
                    borderColor: '#ffa500',
                  }}
                />
              )}
              <Text style={{ textTransform: 'capitalize', marginTop: 5, paddingBottom:50 }}>{evo.name}</Text>
            </TouchableOpacity>
            
          );
        })}
      </ScrollView>
      
    </>
  )}
</ScrollView>

);

}
