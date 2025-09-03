import { gql } from '@apollo/client';


const GET_POKEMONS = gql`
  query {
    pokemon(limit: 20) {
      id
      name
    }
  }
`;
export { GET_POKEMONS };

 const GET_POKEMON_DETAILS = gql`
  query getPokemon($name: String!) {
    pokemon(where: { name: { _eq: $name } }) {
      id
      name
      height
      weight
      types {
        type {
          name
        }
      }
      abilities {
        ability {
          name
        }
      }
      stats {
        base_stat
        stat {
          name
        }
      }
    }
  }
`;
export { GET_POKEMON_DETAILS };


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

export { GET_POKEMON_BASIC };