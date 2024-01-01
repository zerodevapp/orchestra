import dotenv from "dotenv"

dotenv.config()

function getEnvVar(name: string): string {
    const value = process.env[name]
    if (!value) {
        throw new Error(`Required environment variable ${name} is missing`)
    }
    return value
}

export const PRIVATE_KEY = getEnvVar("PRIVATE_KEY")
