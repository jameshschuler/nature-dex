import { useRef, type ReactNode } from "react";
import { Settings2, Sparkles, X } from "lucide-react";
import type { Settings } from "../lib/dex";
import { cn } from "../lib/utils";
import { Segmented, focusRing } from "./ui";

export type SpriteStyle = "normal" | "shiny";

function Setting({ label, hint, children }: { label: string; hint: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-medium">{label}</span>
        {children}
      </div>
      <p className="text-xs text-muted">{hint}</p>
    </div>
  );
}

interface Props {
  settings: Settings;
  setSettings: (s: Partial<Settings>) => void;
  sprites: SpriteStyle;
  setSprites: (s: SpriteStyle) => void;
}

export function SettingsDialog({ settings, setSettings, sprites, setSprites }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const pressedBackdrop = useRef(false);
  return (
    <>
      <button
        type="button"
        onClick={() => ref.current?.showModal()}
        className={cn(
          "inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-line bg-panel px-2.5 py-1.75 text-fg transition-colors hover:bg-sunk",
          focusRing,
        )}
      >
        <Settings2 aria-hidden className="size-4 text-muted" />
        Settings
      </button>
      <dialog
        ref={ref}
        aria-labelledby="settings-title"
        // Clicks on the backdrop land on the dialog element itself. Only close when the press also started there,
        // so a text selection or drag that ends outside the panel doesn't close it.
        onPointerDown={e => { pressedBackdrop.current = e.target === e.currentTarget; }}
        onClick={e => { if (pressedBackdrop.current && e.target === e.currentTarget) e.currentTarget.close(); }}
        className="m-auto w-[min(440px,calc(100vw-32px))] rounded-lg border border-line bg-panel p-0 text-fg shadow-sm backdrop:bg-black/40"
      >
        <div className="flex flex-col gap-4 p-4">
          <div className="flex items-center justify-between gap-3">
            <h2 id="settings-title" className="font-display text-lg font-semibold">Settings</h2>
            <button
              type="button"
              onClick={() => ref.current?.close()}
              aria-label="Close settings"
              className={cn("grid size-8 cursor-pointer place-items-center rounded-md text-muted hover:bg-sunk hover:text-fg", focusRing)}
            >
              <X aria-hidden className="size-4" />
            </button>
          </div>
          <Setting label="Learnsets" hint="Gen 7 is what H&S uses. Gen 3 shows the older level-up and egg move lists where the docs include them.">
            <Segmented
              label="Learnset option"
              value={settings.learn}
              onChange={learn => setSettings({ learn })}
              options={[["hns", "Gen 7 (H&S)"], ["gen3", "Gen 3"]]}
            />
          </Setting>
          <Setting label="Physical/Special split" hint="Off uses the Gen 3 rule, where a move's type decides its category. This changes the best moves and nature picks.">
            <Segmented
              label="Physical/Special split option"
              value={settings.split}
              onChange={split => setSettings({ split })}
              options={[["on", "On"], ["off", "Off"]]}
            />
          </Setting>
          <Setting label="Default sprites" hint="You can still switch any single Pokémon with its sparkles button.">
            <Segmented
              label="Default sprite style"
              value={sprites}
              onChange={setSprites}
              options={[["normal", "Normal"], ["shiny", <><Sparkles aria-hidden className="size-3.5" />Shiny</>]]}
            />
          </Setting>
        </div>
      </dialog>
    </>
  );
}
