"use client";

import { Button } from "@hozui/react";
import { createElement } from "react";
import { trackPostEvent, type PostAnalyticsContext } from "./post-analytics-events";

export async function copyCode(text: string, context: PostAnalyticsContext, target: string) {
  await navigator.clipboard.writeText(text);
  trackPostEvent(context, "code_copy", target);
}

export function CodeCopyButton({
  text,
  target,
  context,
}: {
  text: string;
  target: string;
  context: PostAnalyticsContext;
}) {
  return createElement(Button, {
    label: "Copy",
    onClick: () => void copyCode(text, context, target),
    size: "sm",
    type: "button",
    variant: "secondary",
  });
}
