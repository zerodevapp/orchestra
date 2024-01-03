import { Hex } from "viem"
const HEX_REGEX = /^[0-9a-fA-F]*$/
export function ensureHex(str: string): Hex {
    if (!str.startsWith("0x") && HEX_REGEX.test(str) && str.length % 2 === 0) {
        return `0x${str}` as Hex
    } else if (str.startsWith("0x") && HEX_REGEX.test(str.slice(2)) && str.length % 2 === 0) {
        return str as Hex
    } else {
        throw new Error("Invalid hex string")
    }
}
