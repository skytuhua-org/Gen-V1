const credential = /\b(?:sk-(?:proj-|ant-)?[a-zA-Z0-9_-]{16,}|gh[pousr]_[a-zA-Z0-9]{16,}|github_pat_[a-zA-Z0-9_]{16,}|AIza[a-zA-Z0-9_-]{25,}|AKIA[A-Z0-9]{16})\b|\b(?:api[_-]?key|access[_-]?token|client[_-]?secret|password|passwd|secret|authorization)\s*[:=]\s*["']?[^\s"']{8,}|\bBearer\s+[a-zA-Z0-9._~+/-]{16,}|\beyJ[a-zA-Z0-9_-]{8,}\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+/i;
const privateKeyHeader = /-----BEGIN [A-Z ]*PRIVATE KEY-----/i;
const privateKeyBlock = new RegExp(privateKeyHeader.source + String.raw`[\s\S]*?(?:-----END [A-Z ]*PRIVATE KEY-----|$)`, 'gi');
const allCredentials = new RegExp(credential.source, 'gi');

/** Screens for known credential shapes before publication. */
export function memoryContainsSecret(text: string): boolean {
  return credential.test(text) || privateKeyHeader.test(text);
}

export function redactMemorySecrets(text: string): string {
  return text.replace(privateKeyBlock, '[redacted private key]').replace(allCredentials, '[redacted credential]');
}
