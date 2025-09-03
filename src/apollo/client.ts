import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';

export const client = new ApolloClient({
  link: new HttpLink({
    uri: 'https://beta.pokeapi.co/graphql/v1beta', // your GraphQL endpoint
  }),
  cache: new InMemoryCache(),
});
