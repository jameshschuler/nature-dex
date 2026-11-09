# Nature Hunter Dex

Best natures, move lists and catch locations for the 386 Gen 1–3 Pokémon in Pokémon Heart & Soul v2.0.6, a GBA ROM hack.

## Develop and build

```sh
npm install
npm run dev     # local dev server
npm run build   # typecheck, then write dist/index.html
```

## Refresh data after a new H&S release

```sh
sh scripts/fetch.sh
npm run build
```

`fetch.sh` saves the raw downloads in `raw/`. That folder isn't needed for building.

## Data sources

- Stats, types, abilities, learnsets, evolutions and locations: the official documentation site generated from [pokehns-expansion-documentation](https://github.com/PokemonHnS-Development/pokehns-expansion-documentation) (`pokedex.html`, `moves.html`).
- TM numbering: `include/constants/tms_hms.h` in [pokehns-expansion](https://github.com/PokemonHnS-Development/pokehns-expansion). The list is hard-coded in `extract_hns.py`.
- Split-off move categories: `src/data/types_info.h` in pokehns-expansion. The table is hard-coded as `TYPE_CAT` in `src/lib/dex.ts`.
- National Dex numbers: Pokémon Showdown's `pokedex.json`.
- Sprites, normal and shiny: PokeAPI's Emerald front sprites ([PokeAPI/sprites](https://github.com/PokeAPI/sprites), `sprites/pokemon/versions/generation-iii/emerald/`), loaded at runtime. H&S sets `P_GBA_STYLE_SPECIES_GFX` in pokehns-expansion, so it uses the GBA sprites and palettes. These match the H&S docs sprites, and the shiny sprites made from the game's `shiny_gba.pal` palettes, pixel for pixel for all 386 except Spinda, whose spots the game randomizes per individual.

## How natures are ranked

Natures aren't from an official list. `recommend()` in `src/lib/dex.ts`:

1. Takes each final evolution's base stats.
2. Scales Attack and Sp. Atk by the strongest move it can learn in that category, which depends on the split setting.
3. Classifies it as a physical, special or mixed attacker, or a wall.
4. Picks 3–5 natures for that role.

A few Pokémon are set by hand in `OVERRIDES`.
