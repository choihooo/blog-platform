import type { ComponentProps } from "react";

import { cn } from "../utils.js";

export function Separator({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("h-px w-full bg-border", className)} role="separator" {...props} />;
}
