import type { Metadata } from "next";
import { PixelRoom } from "@/features/pixel-room/pixel-room";

export const metadata: Metadata = {
  title: "호조리카 · 픽셀룸 보관",
  robots: { index: false, follow: false },
};

export default function PixelRoomArchivePage() {
  return <PixelRoom />;
}
