// src/types/pokemon.ts

export interface PokemonType {
  type: {
    name: string;
  };
}

export interface PokemonStat {
  base_stat: number;
  stat: { name: string };
}

export interface Pokemon {
  id: number;
  name: string;
  height: number;
  weight: number;
  sprites: {
    front_default: string;
  };
  pokemontypes: PokemonType[];
  stats: PokemonStat[];
}

// export function getContrastingTextColor(bgColor: string): string {
//   // quick luminance check
//   const c = bgColor.substring(1); // strip #
//   const rgb = parseInt(c, 16); 
//   const r = (rgb >> 16) & 0xff;
//   const g = (rgb >> 8) & 0xff;
//   const b = (rgb >> 0) & 0xff;
//   const luminance = (0.299*r + 0.587*g + 0.114*b) / 255;

//   return luminance > 0.6 ? '#000' : '#fff';
// }