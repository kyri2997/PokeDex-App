import { gql } from '@apollo/client';


const GET_POKEMONS = gql`
  query {
    pokemon(limit: 200, offset: 0) {
       id
      name
      pokemontypes {
        type {
          name
        }
      }
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


const GET_TYPES = gql`
  query getTypes {
        type {
          name
        }
  }
`;
export { GET_TYPES };