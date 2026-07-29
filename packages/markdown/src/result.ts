import type { ValidationIssue, ValidationResult } from "./types.js";

export function issue(code: string, message: string, path: string[]): ValidationIssue {
  return { code, message, path };
}

export function warning(code: string, message: string, path: string[]): ValidationIssue {
  return { code, message, path, severity: "warning" };
}

export function mergeIssues(...groups: ValidationIssue[][]): ValidationIssue[] {
  return groups.flat();
}

export function ok<T>(data: T): ValidationResult<T> {
  return { success: true, data, issues: [] };
}

export function fail<T>(issues: ValidationIssue[]): ValidationResult<T> {
  return { success: false, issues };
}

export function firstIssue(code: string, message: string, path: string[]): ValidationIssue[] {
  return [issue(code, message, path)];
}
