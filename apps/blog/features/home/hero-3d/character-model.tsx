"use client";

import { useAnimations, useGLTF, useTexture } from "@react-three/drei";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { clone as cloneSkeleton } from "three/examples/jsm/utils/SkeletonUtils.js";

const MODEL_PATH = "/models/character/character.glb";
const BASE_COLOR_PATH = "/models/character/base-color.png";

type CharacterModelProps = {
  animationClip: string;
  reducedMotion: boolean;
  onActivate: () => void;
  onReady: () => void;
};

export function CharacterModel({
  animationClip,
  reducedMotion,
  onActivate,
  onReady,
}: CharacterModelProps) {
  const animationRef = useRef<THREE.Group>(null);
  const interactionRef = useRef<THREE.Group>(null);
  const currentActionRef = useRef<THREE.AnimationAction | null>(null);
  const activationPulseRef = useRef(0);
  const { scene, animations } = useGLTF(MODEL_PATH);
  const baseColor = useTexture(BASE_COLOR_PATH);

  const stableAnimations = useMemo(
    () =>
      animations.map((clip) => {
        const stableClip = clip.clone();
        stableClip.tracks = stableClip.tracks.filter(
          (track) => !track.name.startsWith("target_character."),
        );
        return stableClip;
      }),
    [animations],
  );

  const material = useMemo(() => {
    const colorMap = baseColor.clone();
    colorMap.colorSpace = THREE.SRGBColorSpace;
    colorMap.flipY = true;
    colorMap.needsUpdate = true;

    return new THREE.MeshLambertMaterial({
      map: colorMap,
      side: THREE.DoubleSide,
    });
  }, [baseColor]);

  const model = useMemo(() => {
    const clonedScene = cloneSkeleton(scene);

    clonedScene.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;
      object.castShadow = true;
      object.receiveShadow = true;
      object.material = material;
    });

    return clonedScene;
  }, [material, scene]);

  const { actions, names } = useAnimations(stableAnimations, animationRef);

  useFrame(({ pointer }, delta) => {
    const interaction = interactionRef.current;
    if (!interaction) return;

    const targetRotationX = reducedMotion ? 0 : pointer.y * -0.055;
    const targetRotationY = reducedMotion ? 0 : pointer.x * 0.15;
    interaction.rotation.x = THREE.MathUtils.damp(
      interaction.rotation.x,
      targetRotationX,
      5,
      delta,
    );
    interaction.rotation.y = THREE.MathUtils.damp(
      interaction.rotation.y,
      targetRotationY,
      5,
      delta,
    );

    activationPulseRef.current = Math.max(0, activationPulseRef.current - delta * 2.4);
    const pulse = reducedMotion ? 0 : Math.sin(activationPulseRef.current * Math.PI) * 0.035;
    interaction.scale.setScalar(1.08 + pulse);
  });

  useEffect(() => {
    onReady();
  }, [model, onReady]);

  useEffect(() => {
    const fallbackName = names[0];
    const action = actions[animationClip] ?? (fallbackName ? actions[fallbackName] : undefined);
    if (!action) return;

    currentActionRef.current?.fadeOut(reducedMotion ? 0 : 0.2);
    action
      .reset()
      .setLoop(THREE.LoopRepeat, Infinity)
      .fadeIn(reducedMotion ? 0 : 0.2)
      .play();
    action.paused = reducedMotion;
    currentActionRef.current = action;

    return () => {
      action.fadeOut(0.15);
    };
  }, [actions, animationClip, names, reducedMotion]);

  useEffect(
    () => () => {
      document.body.style.cursor = "";
      material.map?.dispose();
      material.dispose();
    },
    [material],
  );

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    if (event.delta > 4) return;
    activationPulseRef.current = 1;
    onActivate();
  };

  return (
    <group
      ref={interactionRef}
      onClick={handleClick}
      onPointerOut={() => {
        document.body.style.cursor = "";
      }}
      onPointerOver={(event) => {
        event.stopPropagation();
        document.body.style.cursor = "pointer";
      }}
      position={[0, -0.05, 0]}
    >
      <group ref={animationRef}>
        <primitive object={model} />
      </group>
    </group>
  );
}

useGLTF.preload(MODEL_PATH);
useTexture.preload(BASE_COLOR_PATH);
