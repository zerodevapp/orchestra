import { Hex } from "viem"

const HEX_REGEX = /^[0-9a-fA-F]*$/
const SALT_REGEX = /^0x[0-9a-fA-F]{64}$/

export function ensureHex(str: string): Hex {
    if (!str.startsWith("0x") && HEX_REGEX.test(str) && str.length % 2 === 0) {
        return `0x${str}` as Hex
    }
    if (
        str.startsWith("0x") &&
        HEX_REGEX.test(str.slice(2)) &&
        str.length % 2 === 0
    ) {
        return str as Hex
    }
    throw new Error("Invalid hex string")
}

// Convert salt to a 32 bytes hex string if it's not already
export function normalizeSalt(salt: string | undefined): string {
    if (!salt) {
        console.error("Salt not specified, please provide a salt")
        process.exit(1)
    }

    if (SALT_REGEX.test(salt)) {
        return salt
    }
    const saltBigInt = BigInt(salt) // Convert to BigInt to handle hex conversion
    return `0x${saltBigInt.toString(16).padStart(64, "0")}`
}
