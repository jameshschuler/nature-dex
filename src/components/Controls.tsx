import { Search } from "lucide-react";
import { LABEL, NATURES, type Role, type Settings } from "../lib/dex";
import { cn } from "../lib/utils";
import { SettingsDialog, type SpriteStyle } from "./SettingsDialog";
import { Segmented, field } from "./ui";

export type Gen = "all" | "1" | "2" | "3";
export interface Filters { q: string; gen: Gen; nature: string; role: Role | "" }

const NATURE_OPTIONS = Object.entries(NATURES)
  .filter(([, [p, m]]) => p !== m)
  .sort((a, b) => a[0].localeCompare(b[0]));

interface Props {
  filters: Filters;
  setFilters: (f: Partial<Filters>) => void;
  settings: Settings;
  setSettings: (s: Partial<Settings>) => void;
  sprites: SpriteStyle;
  setSprites: (s: SpriteStyle) => void;
  shown: number;
}

export function Controls({ filters, setFilters, settings, setSettings, sprites, setSprites, shown }: Props) {
  return (
    <div className="sticky top-[env(safe-area-inset-top,0px)] z-5 flex flex-col gap-2 border-b border-line bg-bg py-2.5">
      <div role="search" className="flex flex-wrap items-center gap-2">
        <label className="relative flex min-w-0 flex-[1_1_200px]">
          <Search aria-hidden className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-silver" />
          <input
            type="search"
            value={filters.q}
            onChange={e => setFilters({ q: e.target.value })}
            placeholder="Search name or dex #"
            aria-label="Search Pokémon"
            className={cn(field, "w-full pl-8")}
          />
        </label>
        <Segmented
          label="Region"
          value={filters.gen}
          onChange={gen => setFilters({ gen })}
          options={[["all", "All"], ["1", "Kanto"], ["2", "Johto"], ["3", "Hoenn"]]}
        />
        <select aria-label="Filter by nature" value={filters.nature} onChange={e => setFilters({ nature: e.target.value })} className={field}>
          <option value="">Any nature</option>
          {NATURE_OPTIONS.map(([n, [p, m]]) => (
            <option key={n} value={n}>{n} (+{LABEL[p]} −{LABEL[m]})</option>
          ))}
        </select>
        <select aria-label="Filter by role" value={filters.role} onChange={e => setFilters({ role: e.target.value as Role | "" })} className={field}>
          <option value="">Any role</option>
          <option value="Physical">Physical attacker</option>
          <option value="Special">Special attacker</option>
          <option value="Mixed">Mixed attacker</option>
          <option value="Wall">Defensive wall</option>
          <option value="Utility">Utility</option>
        </select>
        <SettingsDialog settings={settings} setSettings={setSettings} sprites={sprites} setSprites={setSprites} />
      </div>
      <span className="text-[13px] text-muted tabular-nums">{shown} of 386 shown</span>
    </div>
  );
}
