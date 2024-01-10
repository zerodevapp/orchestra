import dotenv from "dotenv"
import { Hex } from "viem"
import { ensureHex } from "./utils"

dotenv.config()

function getEnvVar(name: string): string | null {
    const value = process.env[name]
    if (!value) {
        return null
    }
    return value
}

const privateKeyEnv = getEnvVar("PRIVATE_KEY")
export const PRIVATE_KEY: Hex | null = privateKeyEnv
    ? ensureHex(privateKeyEnv)
    : null
