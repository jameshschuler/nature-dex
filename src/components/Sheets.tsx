import { LABEL, NATURES, type Stat } from "../lib/dex";
import { focusRing } from "./ui";
import { cn } from "../lib/utils";

const ORDER: Stat[] = ["atk", "def", "spa", "spd", "spe"];
const natureFor = (p: Stat, m: Stat) => Object.keys(NATURES).find(n => NATURES[n][0] === p && NATURES[n][1] === m)!;

const sheet = "flex min-w-0 flex-col gap-2.5 rounded-lg border border-line bg-panel p-4";
const heading = "font-display text-lg font-semibold";

export function NatureChart({ onPick }: { onPick: (nature: string) => void }) {
  const cell = "border border-line px-1.5 py-1.25 text-center";
  const th = cn(cell, "bg-sunk font-mono text-[11px] font-semibold text-muted");
  return (
    <section className={sheet}>
      <h2 className={heading}>Nature chart</h2>
      <p className="text-xs text-muted">
        Rows raise a stat by 10%, columns lower one by 10%. The diagonal is neutral. In the summary screen the raised stat shows in red and the lowered one in blue. Click a nature to see who wants it.
      </p>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[440px] border-collapse text-xs">
          <thead>
            <tr>
              <th className={th} />
              {ORDER.map(m => <th key={m} className={th}><span className="text-down">−{LABEL[m]}</span></th>)}
            </tr>
          </thead>
          <tbody>
            {ORDER.map(p => (
              <tr key={p}>
                <th className={th}><span className="text-up">+{LABEL[p]}</span></th>
                {ORDER.map(m => {
                  const n = natureFor(p, m);
                  return p === m ? (
                    <td key={m} className={cn(cell, "text-muted italic")}>{n}</td>
                  ) : (
                    <td key={m} className={cell}>
                      <button type="button" onClick={() => onPick(n)} className={cn("cursor-pointer rounded px-1 py-0.5 hover:bg-gold-soft", focusRing)}>
                        {n}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function Tips() {
  return (
    <section className={sheet}>
      <h2 className={heading}>Getting natures in H&amp;S</h2>
      <ol className="flex max-w-[65ch] list-decimal flex-col gap-2 pl-[18px] [&_b]:font-semibold">
        <li><b>Nature Mints.</b> The Goldenrod City Flower Shop sells a Mint for every nature after you beat Whitney, ₽20,000 each. A Mint changes the stat effect without hunting.</li>
        <li><b>Synchronize lead.</b> H&amp;S uses the modern rule: with a Synchronize Pokémon first in your party, wild Pokémon always share its nature. Gift Pokémon are excluded. Abra on Routes 34 and 35 can have Synchronize.</li>
        <li><b>Everstone breeding.</b> A parent holding an Everstone always passes its nature to the egg. Either parent works, including Ditto.</li>
        <li><b>Static encounters.</b> Run away and re-enter to reroll the nature. Mew, Deoxys and the first Celebi are the exceptions. Reloading a save state replays the same seed, so it rarely helps.</li>
        <li><b>Evolve freely.</b> Nature never changes on evolution. An Adamant Magikarp becomes an Adamant Gyarados.</li>
      </ol>
    </section>
  );
}
