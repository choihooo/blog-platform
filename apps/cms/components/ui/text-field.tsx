"use client";

import {
  TextField,
  TextFieldControl,
  TextFieldInput,
  TextFieldLabel,
  TextFieldSupportingText,
} from "@hozui/react";
import { useId } from "react";
import type { ChangeEvent, ComponentPropsWithoutRef, ReactNode } from "react";

type NativeInputProps = Omit<
  ComponentPropsWithoutRef<typeof TextFieldInput>,
  "children" | "className" | "id" | "size"
>;

export type CmsTextFieldProps = Omit<
  ComponentPropsWithoutRef<typeof TextField>,
  "children" | "defaultValue" | "onChange" | "placeholder"
> &
  NativeInputProps & {
    helperText?: ReactNode;
    inputClassName?: string;
    inputId?: string;
    label: ReactNode;
    onValueChange?: (value: string, event: ChangeEvent<HTMLInputElement>) => void;
  };

export function CmsTextField({
  helperText,
  inputClassName,
  inputId,
  label,
  onChange,
  onValueChange,
  state,
  ...props
}: CmsTextFieldProps) {
  const generatedId = useId();
  const fieldId = inputId ?? props.id ?? generatedId;
  const supportingTextId = helperText ? `${fieldId}-supporting` : undefined;

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    onChange?.(event);
    onValueChange?.(event.currentTarget.value, event);
  }

  return (
    <TextField state={state}>
      <TextFieldLabel htmlFor={fieldId}>{label}</TextFieldLabel>
      <TextFieldControl>
        <TextFieldInput
          {...props}
          aria-describedby={props["aria-describedby"] ?? supportingTextId}
          aria-invalid={state === "error" || props["aria-invalid"]}
          className={inputClassName}
          id={fieldId}
          onChange={handleChange}
        />
      </TextFieldControl>
      {helperText ? (
        <TextFieldSupportingText
          id={supportingTextId}
          state={state === "error" || state === "success" ? state : "default"}
        >
          {helperText}
        </TextFieldSupportingText>
      ) : null}
    </TextField>
  );
}
