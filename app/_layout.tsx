import React from 'react';
import { ApolloProvider } from '@apollo/client/react';
import { client } from '../src/apollo/client';
import { Slot } from 'expo-router';

export default function Layout() {
  return (
    <ApolloProvider client={client}>
      <Slot />
    </ApolloProvider>
  );
}
