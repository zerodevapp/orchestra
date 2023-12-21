export type Hex = `0x${string}`;

export function ensureHex(str: string): Hex {
  if (!str.startsWith('0x')) {
    return ('0x' + str) as Hex;
  }
  return str as Hex;
}
