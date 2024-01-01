import { Hex } from "viem"
const HEX_REGEX = /^0x[0-9a-fA-F]*$/
export function ensureHex(str: string): Hex {
    if (!str.startsWith("0x") && HEX_REGEX.test(str) && str.length % 2 === 0) {
        return `0x${str}` as Hex
    }
    return str as Hex
}
