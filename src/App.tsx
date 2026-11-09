// Layout: a Pokégear-style dex list, one row per species with an expandable move sheet; controls pinned above, reference sheets below.
import { useCallback, useMemo, useRef, useState } from "react";
import { display } from "./lib/data";
import { buildDex, type Settings } from "./lib/dex";
import { store } from "./lib/utils";
import { Controls, type Filters } from "./components/Controls";
import type { SpriteStyle } from "./components/SettingsDialog";
import { DexRow } from "./components/DexRow";
import type { Tab } from "./components/MoveSheet";
import { NatureChart, Tips } from "./components/Sheets";

export default function App() {
  const [settings, setSettingsState] = useState<Settings>(() => ({
    learn: store.choice("learn", ["hns", "gen3"], "hns"),
    split: store.choice("split", ["on", "off"], "on"),
  }));
  const [filters, setFiltersState] = useState<Filters>({ q: "", gen: "all", nature: "", role: "" });
  const [sprites, setSpritesState] = useState<SpriteStyle>(() => store.choice("sprites", ["normal", "shiny"], "normal"));
  const [open, setOpen] = useState(() => new Map<number, Tab>());
  const listRef = useRef<HTMLDivElement>(null);

  const dex = useMemo(() => buildDex(settings), [settings]);

  const setSettings = (s: Partial<Settings>) => {
    for (const [k, v] of Object.entries(s)) store.set(k, v);
    setSettingsState(prev => ({ ...prev, ...s }));
  };
  const setSprites = (s: SpriteStyle) => {
    store.set("sprites", s);
    setSpritesState(s);
  };
  const setFilters = (f: Partial<Filters>) => setFiltersState(prev => ({ ...prev, ...f }));

  const onTab = useCallback((num: number, tab: Tab | undefined) => {
    setOpen(prev => {
      const next = new Map(prev);
      if (tab) next.set(num, tab);
      else next.delete(num);
      return next;
    });
  }, []);

  const q = filters.q.trim().toLowerCase();
  const rows = dex.filter(m => {
    if (filters.gen !== "all" && m.gen !== +filters.gen) return false;
    if (q && !display(m.name).toLowerCase().includes(q) && String(m.num) !== q.replace(/^#?0*/, "")) return false;
    if (filters.role && !m.branches.some(b => b.role === filters.role)) return false;
    if (filters.nature && !m.branches.some(b => b.picks.some(p => p[0] === filters.nature))) return false;
    return true;
  });

  return (
    <div className="mx-auto flex max-w-[1120px] flex-col gap-4">
      <header>
        <h1 className="font-display text-[30px] leading-tight font-bold text-balance">
          Nature <span className="text-gold">Hunter</span> Dex
        </h1>
        <p className="mt-1 max-w-[68ch] text-muted">
          Best natures and full move lists for all 386 Pokémon from Kanto, Johto and Hoenn in Pokémon Heart &amp; Soul v2.0.6. Natures carry over when a Pokémon evolves, so each pick is based on what it evolves into. Stats, moves and locations come from the{" "}
          <a href="https://heartsoulgame.com/" target="_blank" rel="noopener" className="underline">official H&amp;S documentation</a>. The nature rankings are a rule applied to that data, not an official list.
        </p>
      </header>

      <Controls filters={filters} setFilters={setFilters} settings={settings} setSettings={setSettings} sprites={sprites} setSprites={setSprites} shown={rows.length} />

      <div ref={listRef} className="flex scroll-mt-28 flex-col rounded-lg border border-line bg-panel">
        {rows.length ? (
          rows.map(m => (
            <DexRow
              key={m.num}
              m={m}
              settings={settings}
              nature={filters.nature}
              tab={open.get(m.num)}
              shiny={sprites === "shiny"}
              onTab={onTab}
            />
          ))
        ) : (
          <div className="px-4 py-6 text-center text-muted">
            No Pokémon match these filters. Try clearing the search or picking another nature.
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 min-[821px]:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <NatureChart
          onPick={nature => {
            setFilters({ nature });
            listRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
          }}
        />
        <Tips />
      </div>
    </div>
  );
}
