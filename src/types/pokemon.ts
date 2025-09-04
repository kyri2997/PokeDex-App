// src/types/pokemon.ts

export interface PokemonType {
  type: {
    name: string;
  };
}

export interface Pokemon {
  id: number;
  name: string;
  pokemontypes?: PokemonType[];
}

export interface Type {
  name: string;
}
