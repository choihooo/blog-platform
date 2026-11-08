"use client";

import Link from "next/link";
import type { ComponentProps, MouseEvent, ReactNode } from "react";
import type { BlogEventName } from "@blog-platform/core/analytics";

import { trackPostEvent, type PostAnalyticsContext } from "./post-analytics-events";

type AnalyticsLinkProps = Omit<ComponentProps<typeof Link>, "onClick"> & {
  analyticsContext?: PostAnalyticsContext;
  eventName?: BlogEventName;
  target?: string;
  children: ReactNode;
  onClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
};

export function AnalyticsLink({
  analyticsContext,
  eventName,
  target,
  onClick,
  ...props
}: AnalyticsLinkProps) {
  return (
    <Link
      {...props}
      onClick={(event) => {
        if (analyticsContext && eventName) {
          trackPostEvent(analyticsContext, eventName, target);
        }
        onClick?.(event);
      }}
    />
  );
}
