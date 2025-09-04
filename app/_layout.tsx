import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ApolloProvider } from '@apollo/client/react';
import { client } from '../src/apollo/client';
import { FavouritesProvider } from '../context/FavouritesContext';

export default function Layout() {
  return (
    <ApolloProvider client={client}>
      <FavouritesProvider>
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: '#ff4500',
            tabBarInactiveTintColor: '#555',
            tabBarStyle: { height: 75, paddingBottom: 5 },
          }}
        >
          <Tabs.Screen
            name="index"
            options={{
              title: 'Pokédex',
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="list" size={size} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="favourites"
            options={{
              title: 'Favourites',
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="star" size={size} color={color} />
              ),
            }}
          />
        </Tabs>
      </FavouritesProvider>
    </ApolloProvider>
  );
}
