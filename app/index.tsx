import { View, Text, Button } from 'react-native';
import { useRouter } from 'expo-router';

export default function Home() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Pokédex List Screen</Text>
      <Button
        title="Go to Pikachu"
        onPress={() => router.push('/pokemon/pikachu')} // must match [name].tsx route
      />
    </View>
  );
}
