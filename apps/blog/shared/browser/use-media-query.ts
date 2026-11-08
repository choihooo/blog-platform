"use client";
import { useEffect, useState } from "react";

export function useMediaQuery(query: string, serverValue: boolean) {
  const [state, setState] = useState({ matches: serverValue, ready: false });
  useEffect(() => {
    const media = window.matchMedia(query);
    const update = () => setState({ matches: media.matches, ready: true });
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, [query]);
  return state;
}
