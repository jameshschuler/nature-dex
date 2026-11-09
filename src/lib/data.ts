// Extracted H&S data (see scripts/extract_hns.py) and sprites, bundled into the page at build time.
import raw from "../../data/hns.json?raw";

type LevelMove = [level: number, move: number];
type Place = [place: string, ...how: string[]];

export interface Species {
  name: string;
  slug: string;
  num: number;
  types: string[];
  /** Base stats: HP, Atk, Def, SpA, SpD, Spe. */
  s: [number, number, number, number, number, number];
  ab: string[];
  ha: string[];
  evos: [target: string, how: string][];
  lv: LevelMove[];
  tm: number[];
  tutor: number[];
  egg: number[];
  lv3?: LevelMove[];
  egg3?: number[];
  wild: Place[];
  gifts: Place[];
}

/** "P" physical, "S" special, "X" status. */
export type Category = "P" | "S" | "X";

export interface Move {
  n: string;
  type: string;
  cat: Category;
  pow: number;
  acc: string;
  tm: string;
}

const D = JSON.parse(raw) as {
  species: Species[];
  moves: [string, string, Category, number, string, string][];
};

export const SPECIES_LIST = D.species;
export const MOVES: Move[] = D.moves.map(([n, type, cat, pow, acc, tm]) => ({ n, type, cat, pow, acc, tm }));
export const SPECIES = new Map(D.species.map(s => [s.name, s]));

// PokeAPI's Emerald front sprites. H&S uses the GBA-style sprites and palettes, and these match them pixel for
// pixel (normal and shiny) for all 386 except Spinda, whose spots the game randomizes per individual anyway.
const SPRITE_BASE = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/emerald";
export const sprite = (num: number, shiny = false) => `${SPRITE_BASE}${shiny ? "/shiny" : ""}/${num}.png`;

export const display = (name: string) => name.replace(/ Normal$/, "");
