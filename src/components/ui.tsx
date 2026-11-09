import type { ComponentProps, ReactNode } from "react";
import { cn } from "../lib/utils";

export const focusRing = "outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-1 focus-visible:ring-offset-bg";
export const field = cn(
  "min-w-0 rounded-md border border-line bg-panel px-2.5 py-1.75 text-fg disabled:opacity-50",
  focusRing,
);

const TYPE_DOT: Record<string, string> = {
  Normal: "bg-t-normal", Fire: "bg-t-fire", Water: "bg-t-water", Electric: "bg-t-electric", Grass: "bg-t-grass",
  Ice: "bg-t-ice", Fighting: "bg-t-fighting", Poison: "bg-t-poison", Ground: "bg-t-ground", Flying: "bg-t-flying",
  Psychic: "bg-t-psychic", Bug: "bg-t-bug", Rock: "bg-t-rock", Ghost: "bg-t-ghost", Dragon: "bg-t-dragon",
  Dark: "bg-t-dark", Steel: "bg-t-steel", Fairy: "bg-t-fairy",
};

export function TypeTag({ type }: { type: string }) {
  return (
    <span className="inline-flex items-center gap-1 whitespace-nowrap">
      <span className={cn("size-2 flex-none rounded-full", TYPE_DOT[type] ?? "bg-silver")} />
      {type}
    </span>
  );
}

interface SegmentedProps<T extends string> {
  label: string;
  value: T;
  options: readonly (readonly [T, ReactNode])[];
  onChange: (v: T) => void;
}

export function Segmented<T extends string>({ label, value, options, onChange }: SegmentedProps<T>) {
  return (
    <div role="group" aria-label={label} className="inline-flex overflow-hidden rounded-md border border-line bg-panel">
      {options.map(([v, text]) => (
        <SegButton key={v} pressed={v === value} onClick={() => onChange(v)}>
          {text}
        </SegButton>
      ))}
    </div>
  );
}

function SegButton({ pressed, className, ...props }: ComponentProps<"button"> & { pressed: boolean }) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      className={cn(
        "inline-flex cursor-pointer items-center gap-1.5 px-2.5 py-1.5 text-[13px] text-muted transition-colors [&+&]:border-l [&+&]:border-line",
        "hover:bg-sunk hover:text-fg aria-pressed:bg-fg aria-pressed:text-bg",
        focusRing, "focus-visible:ring-offset-0 focus-visible:ring-inset",
        className,
      )}
      {...props}
    />
  );
}
