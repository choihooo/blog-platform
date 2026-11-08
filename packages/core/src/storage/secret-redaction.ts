const SECRET_TOKEN_PATTERN = /\b(?:gh[pousr]_[A-Za-z0-9_]{12,}|github_pat_[A-Za-z0-9_]+)\b/g;
const PRIVATE_KEY_PATTERN =
  /-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]*?-----END [A-Z ]*PRIVATE KEY-----/g;

export function redactSecrets(value: string, secrets: Array<string | undefined> = []): string {
  let redacted = value
    .replace(PRIVATE_KEY_PATTERN, "[redacted]")
    .replace(SECRET_TOKEN_PATTERN, "[redacted]");

  for (const secret of secrets) {
    if (!secret || secret.length < 4) continue;
    redacted = redacted.split(secret).join("[redacted]");
  }

  return redacted;
}

export function secretFreeMessage(
  message: string | undefined,
  secrets: Array<string | undefined> = [],
): string {
  return redactSecrets(message ?? "Operation failed.", secrets);
}
