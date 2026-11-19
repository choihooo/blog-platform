"use client";
import * as React from "react";
import { Switch as SwitchPrimitive } from "radix-ui";
import { cn } from "../../lib/utils";
export function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      className={cn("setting-switch", className)}
      {...props}
    >
      <SwitchPrimitive.Thumb className="setting-switch-thumb" />
    </SwitchPrimitive.Root>
  );
}
