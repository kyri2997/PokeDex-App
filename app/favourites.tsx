import { View, Text, FlatList, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useFavourites } from '../context/FavouritesContext';

export default function FavouritesPage() {
  const { favourites, removeFavourite } = useFavourites();
  const router = useRouter();

  if (favourites.length === 0) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          padding: 20,
          backgroundColor: '#f0f8ff',
        }}
      >
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#ff4500', marginBottom: 10 }}>
          No Favourites Yet
        </Text>
        <Text style={{ textAlign: 'center', color: '#555', fontSize: 16 }}>
          Add your favourite Pokémon by tapping the ⭐ on their details page!
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={favourites}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={{ padding: 20 }}
      ListHeaderComponent={
        <Text
          style={{
            fontSize: 32,
            fontWeight: 'bold',
            marginTop: 80,
            marginBottom: 20,
            color: '#ff4500',
            textAlign: 'center',
          }}
        >
          Favourites
        </Text>
      }
      renderItem={({ item }) => {
        const spriteUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${item.id}.png`;

        return (
          <TouchableOpacity
            onPress={() => router.push(`/pokemon/${item.name}`)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 15,
              padding: 12,
              borderRadius: 16,
              backgroundColor: '#fff',
              shadowColor: '#000',
              shadowOpacity: 0.1,
              shadowRadius: 10,
              elevation: 3,
            }}
          >
            {/* Sprite */}
            <Image
              source={{ uri: spriteUrl }}
              style={{
                width: 70,
                height: 70,
                marginRight: 12,
                borderRadius: 35,
                borderWidth: 2,
                borderColor: '#ffa500',
              }}
            />

            {/* Name */}
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: 'bold',
                  textTransform: 'capitalize',
                  color: '#ff4500', // hardcoded
                }}
              >
                {item.name}
              </Text>
            </View>

            {/* Remove Button */}
            <TouchableOpacity
              onPress={() => removeFavourite(item.name)}
              style={{
                padding: 6,
                borderRadius: 12,
                backgroundColor: '#ff6347',
              }}
            >
              <Text style={{ color: 'white', fontWeight: 'bold' }}>Remove</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        );
      }}
    />
  );
}
