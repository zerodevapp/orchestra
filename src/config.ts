import dotenv from "dotenv"
import { Hex } from "viem"
import { ensureHex } from "./utils"

dotenv.config()

function getEnvVar(name: string): string {
    const value = process.env[name]
    if (!value) {
        throw new Error(`Required environment variable ${name} is missing`)
    }
    return value
}

export const PRIVATE_KEY: Hex = ensureHex(getEnvVar("PRIVATE_KEY"))
