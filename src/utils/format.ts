import { Hex } from 'viem';

export function ensureHex(str: string): Hex {
  if (!str.startsWith('0x')) {
    return ('0x' + str) as Hex;
  }
  return str as Hex;
}

export function camelToKebabCase(str: string): string {
  return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
}
