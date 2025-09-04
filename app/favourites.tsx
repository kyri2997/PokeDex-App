import { FlatList, View, Text, TouchableOpacity, Image } from "react-native";
import { useRouter } from "expo-router";
import { useFavourites } from  "../context/FavouritesContext";

export default function FavouritesScreen() {
  const { favourites, removeFavourite } = useFavourites();
  const router = useRouter();

  if (favourites.length === 0)
    return <Text style={{ padding: 20, fontSize: 18 }}>No favourites yet.</Text>;

  return (
    <FlatList
      data={favourites}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={{ padding: 20 }}
      renderItem={({ item }) => {
        const spriteUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${item.id}.png`;

        return (
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
            <TouchableOpacity
              style={{ flexDirection: "row", alignItems: "center", flex: 1 }}
              onPress={() => router.push(`/pokemon/${item.name}`)}
            >
              <Image
                source={{ uri: spriteUrl }}
                style={{ width: 50, height: 50, marginRight: 10 }}
              />
              <Text style={{ fontSize: 18, textTransform: "capitalize" }}>{item.name}</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => removeFavourite(item.name)}>
              <Text style={{ color: "red", fontWeight: "bold", marginLeft: 10 }}>Remove</Text>
            </TouchableOpacity>
          </View>
        );
      }}
    />
  );
}
