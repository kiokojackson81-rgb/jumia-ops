export function normalize(input: string): string {
  return (input ?? '')
    .normalize('NFKC')
    .trim()
    .replace(/\s+/g, ' ');
}
