import { Stack } from "expo-router";

export default function PokemonLayout() {
  return (
     <Stack
      screenOptions={{
        gestureEnabled: false, // disables swipe-back for all screens in this stack
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="[name]" options={{ headerShown: false }} />
    </Stack>

  )
}
