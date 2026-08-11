"use client";

import Link from "next/link";
import { motion, useMotionValue, useReducedMotion, useSpring, type Variants } from "motion/react";
import { useState, type PointerEvent } from "react";

import { CharacterSceneLoader } from "./hero-3d/character-scene-loader";
import type { SectionId } from "./hero-3d/character-scene";

const sections = [
  {
    id: "projects",
    href: "/projects",
    index: "01",
    title: "Projects",
    description: "제품과 기술 문제를 해결한 과정",
  },
  {
    id: "blog",
    href: "/blog",
    index: "02",
    title: "Blog",
    description: "개발하며 배운 것과 실험한 기록",
  },
  {
    id: "resume",
    href: "/resume",
    index: "03",
    title: "Resume",
    description: "경력, 활동과 오픈소스 이력",
  },
] as const;

const revealContainer: Variants = {
  hidden: {},
  visible: {
    transition: { delayChildren: 0.12, staggerChildren: 0.075 },
  },
};

const revealItem: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 115, damping: 20, mass: 0.8 },
  },
};

const MotionLink = motion.create(Link);

function MagneticProjectLink({ reducedMotion }: { reducedMotion: boolean }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 180, damping: 18, mass: 0.4 });
  const springY = useSpring(y, { stiffness: 180, damping: 18, mass: 0.4 });

  const handlePointerMove = (event: PointerEvent<HTMLAnchorElement>) => {
    if (reducedMotion || event.pointerType === "touch") return;
    const bounds = event.currentTarget.getBoundingClientRect();
    x.set((event.clientX - bounds.left - bounds.width / 2) * 0.14);
    y.set((event.clientY - bounds.top - bounds.height / 2) * 0.18);
  };

  const resetPosition = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <MotionLink
      className="mt-10 inline-flex touch-manipulation items-center gap-2 border-b border-foreground pb-1 text-sm font-semibold transition-colors hover:border-primary hover:text-primary active:scale-[0.98]"
      href="/projects"
      onPointerLeave={resetPosition}
      onPointerMove={handlePointerMove}
      onPointerUp={resetPosition}
      style={reducedMotion ? undefined : { x: springX, y: springY }}
    >
      프로젝트 보기
      <motion.span
        aria-hidden="true"
        animate={reducedMotion ? undefined : { x: [0, 3, 0] }}
        transition={{ duration: 2.4, repeat: Infinity, repeatDelay: 1.2 }}
      >
        ↗
      </motion.span>
    </MotionLink>
  );
}

export function HomeExperience() {
  const reducedMotion = useReducedMotion() ?? false;
  const [activeSection, setActiveSection] = useState<SectionId>(null);

  return (
    <main className="mx-auto w-full max-w-7xl px-5 pb-16 sm:px-8 sm:pb-24">
      <section className="grid min-h-[calc(100dvh-4rem)] items-center border-x border-border lg:grid-cols-[minmax(0,0.9fr)_minmax(28rem,1.1fr)]">
        <motion.div
          animate="visible"
          className="px-5 py-16 sm:px-10 sm:py-24 lg:py-32"
          initial={reducedMotion ? false : "hidden"}
          variants={revealContainer}
        >
          <motion.p
            className="flex items-center gap-3 text-[11px] font-semibold tracking-[0.18em] text-primary uppercase"
            variants={revealItem}
          >
            <motion.span
              aria-hidden="true"
              className="h-px w-8 origin-left bg-primary"
              variants={
                reducedMotion ? undefined : { hidden: { scaleX: 0 }, visible: { scaleX: 1 } }
              }
            />
            Frontend developer
          </motion.p>
          <h1 className="mt-7 text-4xl leading-[1.06] font-semibold tracking-[-0.035em] sm:text-6xl lg:text-5xl xl:text-6xl">
            <motion.span className="block" variants={revealItem}>
              문제를 발견하고,
            </motion.span>
            <motion.span className="block" variants={revealItem}>
              제품으로 답합니다.
            </motion.span>
          </h1>
          <motion.p
            className="mt-7 max-w-[33rem] text-base leading-7 text-muted-foreground sm:text-lg"
            variants={revealItem}
          >
            안녕하세요, 최호입니다. 사용자 피드백과 운영 과정에서 발견한 문제를 더 나은 경험으로
            연결합니다.
          </motion.p>
          <motion.div variants={revealItem}>
            <MagneticProjectLink reducedMotion={reducedMotion} />
          </motion.div>
        </motion.div>

        <div className="relative min-h-[25rem] self-stretch overflow-hidden border-t border-border bg-muted/25 sm:min-h-[32rem] lg:border-t-0 lg:border-l">
          <CharacterSceneLoader activeSection={activeSection} />
        </div>
      </section>

      <motion.nav
        aria-label="포트폴리오 섹션"
        className="border-x border-b border-border"
        initial={reducedMotion ? false : "hidden"}
        variants={revealContainer}
        viewport={{ amount: 0.2, once: true }}
        whileInView="visible"
      >
        {sections.map((section) => (
          <motion.div
            className="relative overflow-hidden border-t border-border first:border-t-0"
            key={section.href}
            onFocus={() => setActiveSection(section.id)}
            onMouseEnter={() => setActiveSection(section.id)}
            onMouseLeave={() => setActiveSection(null)}
            variants={revealItem}
          >
            <motion.div
              aria-hidden="true"
              className="absolute inset-y-0 left-0 w-1 origin-bottom bg-primary"
              initial={false}
              animate={{ scaleY: activeSection === section.id ? 1 : 0 }}
              transition={{ type: "spring", stiffness: 220, damping: 24 }}
            />
            <Link
              className="group grid gap-3 px-5 py-6 transition-colors hover:bg-muted/50 focus-visible:bg-muted/50 active:bg-muted sm:grid-cols-[3rem_10rem_1fr_auto] sm:items-center sm:px-10"
              href={section.href}
              onBlur={() => setActiveSection(null)}
            >
              <span className="text-xs font-semibold text-primary">{section.index}</span>
              <h2 className="text-xl font-semibold tracking-normal transition-colors group-hover:text-primary group-focus-visible:text-primary">
                {section.title}
              </h2>
              <p className="text-sm leading-6 text-muted-foreground">{section.description}</p>
              <motion.span
                animate={{ x: activeSection === section.id && !reducedMotion ? 5 : 0 }}
                aria-hidden="true"
                className="hidden sm:block"
                transition={{ type: "spring", stiffness: 240, damping: 18 }}
              >
                →
              </motion.span>
            </Link>
          </motion.div>
        ))}
      </motion.nav>
    </main>
  );
}
