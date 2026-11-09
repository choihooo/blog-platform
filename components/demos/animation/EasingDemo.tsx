"use client";

import { DemoContainer } from "@/components/DemoContainer";
import { EasingTracks } from "./EasingTracks";

// 기본 이징 세 가지 비교
export function EasingDemo() {
  return (
    <DemoContainer>
      <EasingTracks
        easings={[
          { label: "linear", easeClass: "ease-linear" },
          { label: "ease-out", easeClass: "ease-out" },
          { label: "ease-in-out", easeClass: "ease-in-out" },
        ]}
      />
    </DemoContainer>
  );
}
