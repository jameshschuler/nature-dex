#!/bin/sh
# Download the source data and extract it. Sprites load from PokeAPI at runtime (see src/lib/data.ts).
# Usage: sh scripts/fetch.sh   (run from the project root)
set -e

DOCS=https://raw.githubusercontent.com/PokemonHnS-Development/pokehns-expansion-documentation/main
mkdir -p raw

curl -sSfL -o raw/pokedex.html "$DOCS/pokedex.html"
curl -sSfL -o raw/moves.html "$DOCS/moves.html"
curl -sSfL -o raw/showdown-pokedex.json https://play.pokemonshowdown.com/data/pokedex.json

python3 -I scripts/extract_hns.py raw/pokedex.html raw/moves.html raw/showdown-pokedex.json data/hns.json

