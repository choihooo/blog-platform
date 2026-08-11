"use client";

import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import {
  Component,
  Suspense,
  useCallback,
  useEffect,
  useState,
  type ErrorInfo,
  type ReactNode,
} from "react";

import { CharacterModel } from "./character-model";
import { GlobePedestal } from "./globe-pedestal";

export type SectionId = "projects" | "blog" | "resume" | null;

const characterActions = [
  { label: "손인사", clip: "019f9935-7eea-7d3b-9765-9be8626a196a" },
  { label: "생각하기", clip: "019f9937-af4d-7427-a92b-44a86b632d9a" },
  { label: "환호", clip: "019f9938-9956-7e37-8523-c4aad2c0af4b" },
] as const;

const sectionActions = {
  projects: {
    label: "프로젝트 가리키기",
    clip: "019f9936-587f-7471-899a-da0109cc17d4",
  },
  blog: characterActions[1],
  resume: {
    label: "인사하기",
    clip: "019f9939-66eb-74cd-95ac-04069dd7793e",
  },
} as const;

function SceneFallback({ failed = false }: { failed?: boolean }) {
  return (
    <div className="absolute inset-0 grid place-items-center bg-muted/40 px-8 text-center">
      <div>
        <span className="mx-auto block h-10 w-px bg-primary" />
        <p className="mt-5 text-[11px] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
          {failed ? "3D preview unavailable" : "Loading character"}
        </p>
      </div>
    </div>
  );
}

class SceneErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  override state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  override componentDidCatch(error: Error, info: ErrorInfo) {
    if (process.env.NODE_ENV !== "production") {
      console.error("3D character scene failed", error, info);
    }
  }

  override render() {
    return this.state.failed ? <SceneFallback failed /> : this.props.children;
  }
}

function supportsWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

export default function CharacterScene({ activeSection }: { activeSection: SectionId }) {
  const [webGLAvailable, setWebGLAvailable] = useState<boolean | null>(null);
  const [ready, setReady] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [actionIndex, setActionIndex] = useState(0);
  const handleReady = useCallback(() => setReady(true), []);
  const selectedAction =
    (activeSection ? sectionActions[activeSection] : characterActions[actionIndex]) ??
    characterActions[0];
  const cycleAction = useCallback(() => {
    setActionIndex((current) => (current + 1) % characterActions.length);
  }, []);

  useEffect(() => {
    setWebGLAvailable(supportsWebGL());
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotionPreference = () => setReducedMotion(mediaQuery.matches);
    updateMotionPreference();
    mediaQuery.addEventListener("change", updateMotionPreference);
    return () => mediaQuery.removeEventListener("change", updateMotionPreference);
  }, []);

  return (
    <div
      className="relative h-full min-h-[25rem] w-full touch-pan-y sm:min-h-[32rem]"
      aria-label="최호의 3D 캐릭터"
    >
      <div className="pointer-events-none absolute top-5 right-5 left-5 z-20 flex items-center justify-between gap-4 text-[10px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
        <span>{isDragging ? "Release to view" : "Drag to rotate"}</span>
        <span className="text-right text-primary">{selectedAction.label}</span>
      </div>

      {!ready || webGLAvailable !== true ? (
        <SceneFallback failed={webGLAvailable === false} />
      ) : null}

      {webGLAvailable ? (
        <SceneErrorBoundary>
          <Canvas
            className="relative z-10 !h-full !w-full"
            camera={{ position: [0, 0.3, 7.2], fov: 35, near: 0.1, far: 100 }}
            dpr={[1, 1.35]}
            gl={{ alpha: true, antialias: true }}
            shadows
          >
            <ambientLight intensity={1.4} />
            <hemisphereLight args={["#fff7cf", "#78a8c7", 1.35]} />
            <directionalLight castShadow position={[3, 5, 4]} intensity={2.2} />
            <directionalLight position={[-4, 2, -3]} intensity={0.65} />

            <Suspense fallback={null}>
              <GlobePedestal reducedMotion={reducedMotion} />
              <CharacterModel
                animationClip={selectedAction.clip}
                onActivate={cycleAction}
                onReady={handleReady}
                reducedMotion={reducedMotion}
              />
            </Suspense>

            <OrbitControls
              enablePan={false}
              enableZoom={false}
              maxPolarAngle={Math.PI / 2}
              minPolarAngle={Math.PI / 2}
              onEnd={() => setIsDragging(false)}
              onStart={() => setIsDragging(true)}
              target={[0, -0.15, 0]}
            />
          </Canvas>
        </SceneErrorBoundary>
      ) : null}

      <div className="absolute right-5 bottom-5 left-5 z-20 flex items-center justify-between gap-4 border-t border-border pt-3 text-[10px] font-medium tracking-[0.14em] text-muted-foreground uppercase">
        <span className="pointer-events-none">Character interaction</span>
        <button
          className="touch-manipulation border-b border-current pb-0.5 text-foreground transition-colors hover:text-primary focus-visible:text-primary active:scale-[0.98]"
          onClick={cycleAction}
          type="button"
        >
          동작 바꾸기
        </button>
      </div>
    </div>
  );
}
