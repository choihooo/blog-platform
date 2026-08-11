"use client";

import dynamic from "next/dynamic";

import type { SectionId } from "./character-scene";

const CharacterScene = dynamic(() => import("./character-scene"), {
  ssr: false,
  loading: () => (
    <div className="grid min-h-[25rem] place-items-center bg-muted/40 sm:min-h-[32rem]">
      <p className="text-[11px] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
        Loading character
      </p>
    </div>
  ),
});

export function CharacterSceneLoader({ activeSection }: { activeSection: SectionId }) {
  return <CharacterScene activeSection={activeSection} />;
}
