import { Stack } from "expo-router";

export default function PokemonLayout() {
  return (
       <Stack>
      {/* Dynamic Pokémon details screen */}
      <Stack.Screen
        name="[name]"
        options={{
          headerShown: false,
          gestureEnabled: false, // disables swipe-back
        }}
      />
    </Stack>

  )
}
