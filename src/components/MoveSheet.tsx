import { display, MOVES, SPECIES } from "../lib/data";
import { CAT_NAME, category, eggs, levelUp, type DexEntry, type Settings } from "../lib/dex";
import { cn } from "../lib/utils";
import { TypeTag, focusRing } from "./ui";

export type Tab = "lv" | "tm" | "tutor" | "egg" | "where";
type Row = { key: string; id: number };

function MoveTable({ rows, m, settings, fitCat }: { rows: Row[]; m: DexEntry; settings: Settings; fitCat: "P" | "S" | null }) {
  if (!rows.length) return <p className="max-w-[60ch] text-[12.5px] text-muted">No moves in this list.</p>;
  const th = "sticky top-0 bg-sunk px-2 py-1.25 text-left text-[11px] font-semibold tracking-[.04em] text-muted uppercase";
  const num = "px-2 py-1 font-mono text-[11.5px] tabular-nums";
  return (
    <div className="max-h-[360px] overflow-auto rounded-md border border-line">
      <table className="w-full min-w-[460px] border-collapse text-[12.5px]">
        <thead>
          <tr>
            <th className={th} /><th className={th}>Move</th><th className={th}>Type</th><th className={th}>Category</th>
            <th className={cn(th, "text-right")}>Pow</th><th className={cn(th, "text-right")}>Acc</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ key, id }, i) => {
            const mv = MOVES[id], c = category(mv, settings);
            const stab = c !== "X" && m.types.includes(mv.type);
            const fits = c !== "X" && c === fitCat;
            return (
              <tr key={i} className="border-t border-line whitespace-nowrap">
                <td className={cn(num, "w-14 text-silver")}>{key}</td>
                <td className={cn("px-2 py-1", stab && "font-semibold")}>{mv.n}</td>
                <td className="px-2 py-1"><TypeTag type={mv.type} /></td>
                <td className={cn("px-2 py-1", fits && "font-semibold text-up")}>{CAT_NAME[c]}</td>
                <td className={cn(num, "text-right")}>{mv.pow > 1 ? mv.pow : "—"}</td>
                <td className={cn(num, "text-right")}>{mv.acc || "—"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function MoveSheet({ m, settings, tab, onTab }: { m: DexEntry; settings: Settings; tab: Tab; onTab: (t: Tab) => void }) {
  // Highlight moves in the category this Pokémon attacks with; mixed attackers and walls get no highlight.
  const role = m.branches[0].role;
  const fitCat = role === "Physical" ? "P" : role === "Special" ? "S" : null;
  const lv = levelUp(m, settings), egg = eggs(m, settings);
  const tm = [...m.tm].sort((a, b) => MOVES[a].tm.localeCompare(MOVES[b].tm));
  const places = [...m.wild, ...m.gifts];
  const tabs: [Tab, string, number][] = [
    ["lv", "Level up", lv.length], ["tm", "TM / HM", tm.length], ["tutor", "Tutor", m.tutor.length],
    ["egg", "Egg", egg.length], ["where", "Where to find", places.length],
  ];
  const rows: Record<Exclude<Tab, "where">, Row[]> = {
    lv: lv.map(([l, id]) => ({ key: l === 0 ? "Evo" : `Lv ${l}`, id })),
    tm: tm.map(id => ({ key: MOVES[id].tm, id })),
    tutor: m.tutor.map(id => ({ key: "", id })),
    egg: egg.map(id => ({ key: "", id })),
  };

  return (
    <div className="flex flex-col gap-2.5 px-3.5 pb-3.5 min-[821px]:pl-[92px]">
      <div className="flex flex-wrap gap-x-[18px] gap-y-1 text-[12.5px] text-muted">
        <span>
          Abilities: <b className="font-semibold text-fg">{m.ab.join(" / ")}</b>
          {m.ha.length > 0 && <> · Hidden: <b className="font-semibold text-fg">{m.ha.join(" / ")}</b></>}
        </span>
        {m.evos.filter(([t]) => SPECIES.has(t)).map(([t, how]) => (
          <span key={t}>Evolves into <b className="font-semibold text-fg">{display(t)}</b>{how && ` · ${how}`}</span>
        ))}
      </div>
      <div role="tablist" className="flex flex-wrap gap-0.5 border-b border-line">
        {tabs.map(([k, label, count]) => (
          <button
            key={k}
            type="button"
            role="tab"
            aria-selected={k === tab}
            onClick={() => onTab(k)}
            className={cn(
              "-mb-px cursor-pointer border-b-2 border-transparent px-2.5 py-1.5 text-[13px] text-muted hover:text-fg",
              "aria-selected:border-gold aria-selected:font-semibold aria-selected:text-fg", focusRing,
            )}
          >
            {label}<span className="ml-[3px] font-mono text-[11px] text-silver">{count}</span>
          </button>
        ))}
      </div>
      {tab === "where" ? (
        places.length ? (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-2">
            {places.map(([p, ...how], i) => (
              <div key={i} className="min-w-0 rounded-md bg-sunk px-2.5 py-2">
                <b className="block text-[13px] font-semibold">{p}</b>
                {how.map((h, j) => <span key={j} className="block text-xs text-muted">{h}</span>)}
              </div>
            ))}
          </div>
        ) : (
          <p className="max-w-[60ch] text-[12.5px] text-muted">Not found in the wild. Get it by evolving or breeding an earlier form.</p>
        )
      ) : (
        <>
          <MoveTable rows={rows[tab]} m={m} settings={settings} fitCat={fitCat} />
          <p className="text-xs text-muted">
            Bold moves get STAB (same type as {display(m.name)}).{" "}
            {fitCat && `Green categories match its role (${role.toLowerCase()} attacker). `}
            Categories follow your split setting. Its evolutions can have different moves.
          </p>
        </>
      )}
    </div>
  );
}
