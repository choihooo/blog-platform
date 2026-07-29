const DEFAULT_ALLOWED_COMPONENTS = new Set(["Callout"]);

export function isAllowedComponent(name: string, allowedComponents?: string[]): boolean {
  const allowed = allowedComponents ? new Set(allowedComponents) : DEFAULT_ALLOWED_COMPONENTS;
  return allowed.has(name);
}
