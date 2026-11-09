// Nature ranking: classify each final evolution's role from its stats and best moves, then pick natures for that role.
import { MOVES, SPECIES, SPECIES_LIST, type Category, type Move, type Species } from "./data";

export type Stat = "hp" | "atk" | "def" | "spa" | "spd" | "spe";
export type Role = "Physical" | "Special" | "Mixed" | "Wall" | "Utility";
type Pick = [nature: string, why: string];

export interface Settings {
  learn: "hns" | "gen3";
  split: "on" | "off";
}

export const LABEL: Record<Stat, string> = { hp: "HP", atk: "Atk", def: "Def", spa: "SpA", spd: "SpD", spe: "Spe" };
export const NATURES: Record<string, [up: Stat, down: Stat]> = {
  Hardy: ["atk", "atk"], Lonely: ["atk", "def"], Brave: ["atk", "spe"], Adamant: ["atk", "spa"], Naughty: ["atk", "spd"],
  Bold: ["def", "atk"], Docile: ["def", "def"], Relaxed: ["def", "spe"], Impish: ["def", "spa"], Lax: ["def", "spd"],
  Timid: ["spe", "atk"], Hasty: ["spe", "def"], Serious: ["spe", "spe"], Jolly: ["spe", "spa"], Naive: ["spe", "spd"],
  Modest: ["spa", "atk"], Mild: ["spa", "def"], Quiet: ["spa", "spe"], Bashful: ["spa", "spa"], Rash: ["spa", "spd"],
  Calm: ["spd", "atk"], Gentle: ["spd", "def"], Sassy: ["spd", "spe"], Careful: ["spd", "spa"], Quirky: ["spd", "spd"],
};
export const CAT_NAME: Record<Category, string> = { P: "Physical", S: "Special", X: "Status" };

// With the split off, H&S decides physical/special by type (src/data/types_info.h): Ghost is special, Dark physical.
const TYPE_CAT: Record<string, Category> = {
  Normal: "P", Fighting: "P", Flying: "P", Poison: "P", Ground: "P", Rock: "P", Bug: "P", Steel: "P", Dark: "P",
  Ghost: "S", Fire: "S", Water: "S", Grass: "S", Electric: "S", Psychic: "S", Ice: "S", Dragon: "S", Fairy: "S",
};
// Damaging moves left out when judging a Pokémon's best attack: recharge, self-KO, charge-up or situational.
const SKIP = new Set(["Explosion", "Self-Destruct", "Hyper Beam", "Giga Impact", "Blast Burn", "Hydro Cannon", "Frenzy Plant",
  "Rock Wrecker", "Focus Punch", "Dream Eater", "Last Resort", "Sky Attack", "Future Sight", "Doom Desire", "Fake Out",
  "Belch", "Steel Beam", "Mind Blown", "Synchronoise", "Solar Beam", "Solar Blade", "Skull Bash", "Razor Wind", "Sky Drop"]);

export const category = (m: Move, settings: Settings): Category =>
  m.cat === "X" ? "X" : settings.split === "on" ? m.cat : TYPE_CAT[m.type] || m.cat;
export const levelUp = (s: Species, settings: Settings) => (settings.learn === "gen3" && s.lv3 ? s.lv3 : s.lv);
export const eggs = (s: Species, settings: Settings) => (settings.learn === "gen3" && s.egg3 ? s.egg3 : s.egg);

function finals(s: Species, seen = new Set<string>()): Species[] {
  seen.add(s.name);
  const next = s.evos.map(([t]) => SPECIES.get(t)).filter((t): t is Species => !!t && !seen.has(t.name));
  return next.length ? [...new Set(next.flatMap(t => finals(t, seen)))] : [s];
}

interface Best { m: Move; v: number }
type BestMoves = { P: Best | null; S: Best | null };

function bestMoves(s: Species, settings: Settings): BestMoves {
  const ids = new Set([...levelUp(s, settings).map(x => x[1]), ...s.tm, ...s.tutor, ...eggs(s, settings)]);
  const best: BestMoves = { P: null, S: null };
  for (const id of ids) {
    const m = MOVES[id], c = category(m, settings);
    if (c === "X" || m.pow < 40 || SKIP.has(m.n)) continue;
    const acc = parseInt(m.acc, 10);
    const v = m.pow * (s.types.includes(m.type) ? 1.5 : 1) * (acc > 0 ? acc / 100 : 1);
    if (!best[c] || v > best[c].v) best[c] = { m, v };
  }
  return best;
}

interface Scaled { hp: number; atk: number; def: number; spa: number; spd: number; spe: number }

function classify(s: Scaled): Role {
  const off = Math.max(s.atk, s.spa);
  const avgDef = (s.def + s.spd) / 2;
  if ((avgDef >= off + 25 && off < 95) || (s.hp >= 150 && off < 90)) return "Wall";
  // Mixed natures lower a defense, so bulky Pokémon stay on their stronger side instead.
  const bulky = s.def >= 100 || s.spd >= 100;
  if (!bulky && Math.abs(s.atk - s.spa) < 20 && Math.min(s.atk, s.spa) >= 70) return "Mixed";
  return s.atk >= s.spa ? "Physical" : "Special";
}

const OVERRIDES: Record<string, { role: Role; picks: Pick[]; note?: string }> = {
  Ditto: { role: "Utility", note: "Nature does not matter in battle because Transform copies the target's stats. For breeding, a Ditto holding an Everstone always passes its nature, so catch one with a nature you want to breed.", picks: [] },
  Smeargle: { role: "Utility", picks: [["Jolly", "Fast Spore lead"], ["Timid", "Fast, special moves"], ["Impish", "Bulkier support"]] },
  Shedinja: { role: "Physical", picks: [["Adamant", "Max damage"], ["Jolly", "Outspeed more threats"], ["Brave", "Slow, max power"]] },
  Skarmory: { role: "Wall", picks: [["Impish", "Classic physical wall"], ["Careful", "Patch weaker SpD"], ["Relaxed", "Slow Def wall"], ["Adamant", "Offensive set"]] },
  Wobbuffet: { role: "Wall", picks: [["Bold", "Survive physical hits"], ["Calm", "Survive special hits"], ["Impish", "Physical bulk"], ["Careful", "Special bulk"]] },
  Blissey: { role: "Wall", picks: [["Bold", "Patch its tiny Def"], ["Calm", "Max special wall"], ["Modest", "Offensive special"]] },
};

function pick(s: Scaled, role: Role): Pick[] {
  const fast = s.spe >= 85, slow = s.spe <= 50;
  const bulky = s.hp >= 100 || s.def >= 100 || s.spd >= 100;
  const out: Pick[] = [];
  const add = (n: string, why: string) => { if (!out.some(p => p[0] === n)) out.push([n, why]); };
  const defFirst = s.def <= s.spd; // shore up the weaker side first
  if (role === "Physical" || role === "Special") {
    const P = role === "Physical";
    const power = P ? "Adamant" : "Modest", speed = P ? "Jolly" : "Timid", trick = P ? "Brave" : "Quiet";
    const dNat = P ? "Impish" : "Bold", sdNat = P ? "Careful" : "Calm";
    if (fast) { add(speed, "Fast sweeper"); add(power, "Max damage"); }
    else if (slow) { add(power, "Max damage"); add(trick, "Too slow to need Spe"); }
    else { add(power, "Max damage"); add(speed, "Win speed ties"); }
    if (bulky) {
      if (defFirst) { add(dNat, "Bulkier, physical"); add(sdNat, "Bulkier, special"); }
      else { add(sdNat, "Bulkier, special"); add(dNat, "Bulkier, physical"); }
    } else {
      // Frail attackers: offer mixed-moveset natures that sacrifice the weaker defense.
      if (!slow) add(defFirst ? "Hasty" : "Naive", "Fast, mixed moves");
      add(P ? (defFirst ? "Lonely" : "Naughty") : (defFirst ? "Mild" : "Rash"), "Strong, mixed moves");
    }
  } else if (role === "Mixed") {
    const atkLead = s.atk >= s.spa;
    const dropDef = s.def < s.spd;
    if (s.spe >= 70) add(dropDef ? "Hasty" : "Naive", "Fast mixed attacker");
    if (atkLead) { add(dropDef ? "Lonely" : "Naughty", "Mixed, Atk-leaning"); add(dropDef ? "Mild" : "Rash", "Mixed, SpA-leaning"); }
    else { add(dropDef ? "Mild" : "Rash", "Mixed, SpA-leaning"); add(dropDef ? "Lonely" : "Naughty", "Mixed, Atk-leaning"); }
    add(atkLead ? "Adamant" : "Modest", "Pure " + (atkLead ? "physical" : "special"));
    add(atkLead ? "Modest" : "Adamant", "Pure " + (atkLead ? "special" : "physical"));
  } else {
    const P = s.atk >= s.spa;
    const dNat = P ? "Impish" : "Bold", sdNat = P ? "Careful" : "Calm";
    if (defFirst) { add(dNat, "Patch weaker Def"); add(sdNat, "Special wall"); }
    else { add(sdNat, "Patch weaker SpD"); add(dNat, "Physical wall"); }
    if (s.spe <= 50) add(defFirst ? "Relaxed" : "Sassy", "Slow anyway, max bulk");
    add(P ? "Adamant" : "Modest", "Hit harder");
  }
  return out.slice(0, 5);
}

export interface Branch { final: Species; role: Role; picks: Pick[]; note?: string; best: BestMoves }

function recommend(f: Species, settings: Settings): Omit<Branch, "final"> {
  const best = bestMoves(f, settings);
  const o = OVERRIDES[f.name];
  if (o) return { ...o, best };
  const [hp, atk, def, spa, spd, spe] = f.s;
  // Scale each attacking stat by how good its best usable move is (135 = a 90-power STAB move).
  const scale = (b: Best | null) => (b ? Math.min(1, b.v / 135) : 0.45);
  const s = { hp, def, spd, spe, atk: atk * scale(best.P), spa: spa * scale(best.S) };
  const role = classify(s);
  return { role, picks: pick(s, role), best };
}

export interface DexEntry extends Species { gen: 1 | 2 | 3; branches: Branch[] }

export function buildDex(settings: Settings): DexEntry[] {
  // Every species in a line shares its final evolutions' recommendations, so work each one out once.
  const cache = new Map<string, Branch>();
  const branch = (f: Species) => {
    if (!cache.has(f.name)) cache.set(f.name, { final: f, ...recommend(f, settings) });
    return cache.get(f.name)!;
  };
  return SPECIES_LIST.filter(s => s.num >= 1 && s.num <= 386 && !/^(Alolan|Galarian|Hisuian|Paldean) /.test(s.name))
    .map(s => ({
      ...s,
      gen: s.num <= 151 ? 1 : s.num <= 251 ? 2 : 3,
      branches: finals(s).map(branch),
    }));
}
