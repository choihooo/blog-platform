"use client";

import { DemoContainer } from "@/components/DemoContainer";
import { EasingTracks } from "./EasingTracks";

// 기본 ease-out과 Radix가 쓰는 cubic-bezier 곡선 비교
export function RadixEasingDemo() {
  return (
    <DemoContainer>
      <EasingTracks
        easings={[
          { label: "ease-out", easeClass: "ease-out" },
          {
            label: "cubic-bezier(0.16, 1, 0.3, 1)",
            easeClass: "ease-[cubic-bezier(0.16,1,0.3,1)]",
          },
        ]}
      />
    </DemoContainer>
  );
}
