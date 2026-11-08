export type AboutContact = { email: string; githubUrl: string };

export function getAboutPresentation(reducedMotion: boolean, height: number, failed: boolean) {
  return reducedMotion || height <= 540 || failed ? "static" : "scroll";
}

export const aboutMedia = {
  video: "/brand/about/story.mp4",
  poster: "/brand/about/story-poster.webp",
};

export const aboutChapters = [
  {
    id: "intro",
    label: "소개",
    title: "안녕하세요,\n호조리카입니다.",
    description: "프론트엔드 개발자 최호입니다.\n직접 만들고, 배우고, 함께하는 걸 좋아해요.",
    start: 0,
  },
  {
    id: "work",
    label: "만드는 일",
    title: "아이디어를\n직접 만들어봅니다.",
    description: "요즘은 웹 서비스를 만들고, 더 나은 사용자 경험을 고민하고 있어요.",
    start: 0.14,
    action: "portfolio",
  },
  {
    id: "football",
    label: "축구",
    title: "가끔은,\n화면 밖으로.",
    description: "축구를 좋아해요. 함께 뛰고 공을 주고받는 시간이 즐겁습니다.",
    start: 0.303,
  },
  {
    id: "community",
    label: "함께 배우기",
    title: "함께하면\n더 재밌으니까요.",
    description: "동아리와 스터디에서 사람들을 만나고, 함께 배우는 걸 좋아해요.",
    start: 0.49,
  },
  {
    id: "photography",
    label: "사진",
    title: "좋은 순간을\n남기는 일도 좋아해요.",
    description: "사진을 찍으며, 그냥 지나칠 뻔한 장면을 한 번 더 바라봅니다.",
    start: 0.654,
  },
  {
    id: "contact",
    label: "연락처",
    title: "우리,\n이야기 나눠요.",
    description: "함께 만들고 싶은 일이나 나누고 싶은 이야기가 있다면 편하게 연락해 주세요.",
    start: 0.756,
    action: "contact",
  },
] as const;

export function getAboutChapter(progress: number) {
  let chapter = 0;
  for (const [index, item] of aboutChapters.entries()) {
    if (progress >= item.start) chapter = index;
  }
  return chapter;
}
