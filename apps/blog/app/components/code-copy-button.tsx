"use client";

import { Button, Toast, ToastStack } from "@hozui/react";
import { createElement, Fragment, useState } from "react";
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
  const [toast, setToast] = useState<{
    id: number;
    title: string;
    tone: "success" | "error";
  }>();

  async function handleCopy() {
    try {
      await copyCode(text, context, target);
      setToast((current) => ({
        id: (current?.id ?? 0) + 1,
        title: "코드를 복사했습니다.",
        tone: "success",
      }));
    } catch {
      setToast((current) => ({
        id: (current?.id ?? 0) + 1,
        title: "복사하지 못했습니다.",
        tone: "error",
      }));
    }
  }

  return createElement(
    Fragment,
    null,
    createElement(Button, {
      label: "Copy",
      onClick: () => void handleCopy(),
      size: "sm",
      type: "button",
      variant: "secondary",
    }),
    createElement(ToastStack, {
      children: toast
        ? createElement(Toast, {
            key: toast.id,
            onOpenChange: (open) => {
              if (!open) setToast(undefined);
            },
            open: true,
            showCloseButton: true,
            title: toast.title,
            tone: toast.tone,
          })
        : null,
      placement: "bottom-right",
    }),
  );
}
