import { memo, useState } from "react";
import { ChevronDown, ImageOff, Sparkles } from "lucide-react";
import { display, sprite } from "../lib/data";
import { LABEL, NATURES, type Branch, type DexEntry, type Settings } from "../lib/dex";
import { cn } from "../lib/utils";
import { MoveSheet, type Tab } from "./MoveSheet";
import { TypeTag, focusRing } from "./ui";

function NatureChip({ name, why, rank, hit }: { name: string; why: string; rank: number; hit: boolean }) {
  const [p, m] = NATURES[name];
  return (
    <div
      className={cn(
        "inline-flex min-w-0 flex-col rounded-md border border-line bg-panel px-2 pt-1 pb-1.25",
        rank === 0 && "border-gold bg-gold-soft",
        hit && "outline-2 -outline-offset-1 outline-fg",
      )}
    >
      <span className="flex items-baseline gap-1.5 text-[13px] font-semibold">
        <span className="font-mono text-[10px] text-silver">{rank + 1}</span>
        {name}
      </span>
      <span className="font-mono text-[10.5px]">
        <span className="text-up">+{LABEL[p]}</span> <span className="text-down">−{LABEL[m]}</span>
      </span>
      <span className="text-[11px] text-muted">{why}</span>
    </div>
  );
}

function BranchRecs({ m, b, nature }: { m: DexEntry; b: Branch; nature: string }) {
  const evolves = m.branches.length > 1 || b.final.name !== m.name;
  const step = m.evos.find(([t]) => t === b.final.name);
  const best = (["P", "S"] as const).filter(k => b.best[k])
    .map(k => `Best ${k === "P" ? "physical" : "special"}: ${b.best[k]!.m.n}`).join(" · ");
  return (
    <div>
      <div className="mb-1 text-xs text-muted">
        {evolves && (
          <>
            {m.branches.length > 1 ? "If it becomes" : "Based on"}{" "}
            <b className="font-semibold text-fg">{display(b.final.name)}</b>
            {step?.[1] && <span> ({step[1]})</span>}
          </>
        )}
        {best && <span className="block text-[11.5px]">{best}</span>}
      </div>
      {b.picks.length ? (
        <div className="flex flex-wrap gap-1.5">
          {b.picks.map(([n, why], i) => <NatureChip key={n} name={n} why={why} rank={i} hit={n === nature} />)}
        </div>
      ) : (
        <p className="max-w-[60ch] text-[12.5px] text-muted">{b.note}</p>
      )}
    </div>
  );
}

function Sprite({ num, name, shiny }: { num: number; name: string; shiny: boolean }) {
  const src = sprite(num, shiny);
  const [failed, setFailed] = useState<string>();
  const box = cn("col-start-1 row-start-1 block size-16 rounded-md bg-sunk", shiny && "bg-gold-soft");
  const alt = `${shiny ? "Shiny " : ""}${name}`;
  // Sprites load from PokeAPI; if that's unreachable, keep the row's layout with a quiet placeholder.
  if (failed === src) {
    return (
      <div role="img" aria-label={alt} title="Sprite unavailable" className={cn(box, "grid place-items-center text-silver")}>
        <ImageOff aria-hidden className="size-5" />
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      width={64}
      height={64}
      loading="lazy"
      onError={() => setFailed(src)}
      className={cn(box, "[image-rendering:pixelated]")}
    />
  );
}

interface Props {
  m: DexEntry;
  settings: Settings;
  nature: string;
  tab: Tab | undefined;
  shiny: boolean;
  onTab: (num: number, tab: Tab | undefined) => void;
}

export const DexRow = memo(function DexRow({ m, settings, nature, tab, shiny, onTab }: Props) {
  const name = display(m.name);
  // The sparkles button flips just this row; changing the default sprite setting drops the flip.
  const [flip, setFlip] = useState<{ base: boolean; shiny: boolean }>();
  const showShiny = flip?.base === shiny ? flip.shiny : shiny;
  const roles = [...new Set(m.branches.map(b => b.role))].join(" / ");
  return (
    <div className="border-t border-line first:border-t-0">
      <div className="grid grid-cols-[64px_minmax(0,1fr)_auto] items-start gap-3.5 px-3.5 py-2.5 min-[821px]:grid-cols-[64px_minmax(150px,1fr)_minmax(0,2.6fr)_auto]">
        <Sprite num={m.num} name={name} shiny={showShiny} />
        <div className="col-start-2 row-start-1 min-w-0">
          <span className="font-mono text-xs text-silver tabular-nums">#{String(m.num).padStart(3, "0")}</span>
          <div className="truncate font-display text-base font-semibold" title={name}>{name}</div>
          <div className="flex flex-wrap gap-2 text-xs text-muted">{m.types.map(t => <TypeTag key={t} type={t} />)}</div>
          <span className="mt-1 inline-block rounded border border-line px-1.25 text-[11px] tracking-[.06em] text-muted uppercase">{roles}</span>
        </div>
        <div className="col-span-full row-start-2 flex min-w-0 flex-col gap-2 min-[821px]:col-span-1 min-[821px]:col-start-3 min-[821px]:row-start-1">
          {m.branches.map(b => <BranchRecs key={b.final.name} m={m} b={b} nature={nature} />)}
        </div>
        <div className="col-start-3 row-start-1 flex flex-col items-stretch gap-1.5 min-[821px]:col-start-4">
          <button
            type="button"
            onClick={() => setFlip({ base: shiny, shiny: !showShiny })}
            aria-pressed={showShiny}
            aria-label={`Show shiny ${name}`}
            title={showShiny ? "Show normal" : "Show shiny"}
            className={cn(
              "grid size-8 cursor-pointer place-items-center self-end rounded-md border border-transparent text-silver transition-colors hover:border-line hover:text-gold",
              showShiny && "text-gold", focusRing,
            )}
          >
            <Sparkles aria-hidden className={cn("size-4.5", showShiny && "fill-current")} />
          </button>
          <button
            type="button"
            onClick={() => onTab(m.num, tab ? undefined : "lv")}
            aria-expanded={!!tab}
            className={cn(
              "inline-flex cursor-pointer items-center justify-center gap-1 rounded-md border border-line bg-panel px-2 py-1.25 text-xs whitespace-nowrap text-fg transition-colors hover:bg-sunk",
              tab && "border-fg bg-fg text-bg hover:bg-fg", focusRing,
            )}
          >
            {tab ? "Hide moves" : "Moves"}
            <ChevronDown aria-hidden className={cn("size-3.5 transition-transform", tab && "rotate-180")} />
          </button>
        </div>
      </div>
      {tab && <MoveSheet m={m} settings={settings} tab={tab} onTab={t => onTab(m.num, t)} />}
    </div>
  );
});
