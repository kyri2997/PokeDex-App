import { View, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

export default function PokemonDetails() {
  const { name } = useLocalSearchParams<{ name: string }>();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold' }}>Details for {name}</Text>
    </View>
  );
}
