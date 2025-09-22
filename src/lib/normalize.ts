// src/lib/normalize.ts

/** very simple string normalizer */
export function normalize(input: string): string {
  return (input ?? '')
    .toString()
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}
