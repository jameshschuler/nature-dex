import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

// Settings persist per browser.
export const store = {
  get<T>(k: string, d: T): T {
    try { const v = localStorage.getItem("nhd-" + k); return v == null ? d : (JSON.parse(v) as T); } catch { return d; }
  },
  /** A stored string that must be one of `options`; anything else (stale or hand-edited) falls back to `d`. */
  choice<T extends string>(k: string, options: readonly T[], d: T): T {
    const v = store.get<unknown>(k, d);
    return options.includes(v as T) ? (v as T) : d;
  },
  set(k: string, v: unknown) {
    try { localStorage.setItem("nhd-" + k, JSON.stringify(v)); } catch { /* storage blocked */ }
  },
};
