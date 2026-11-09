"use client";

import { Button } from "@hozui/react";
import { useFormStatus } from "react-dom";

export function CategorySubmitButton({
  disabled,
  label,
  variant,
}: {
  disabled?: boolean;
  label: string;
  variant?: "primary" | "danger";
}) {
  const { pending } = useFormStatus();

  return (
    <Button
      className="w-fit"
      disabled={disabled || pending}
      label={label}
      loading={pending}
      type="submit"
      variant={variant}
    />
  );
}
