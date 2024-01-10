#!/usr/bin/env node
import dotenv from "dotenv"
import { program } from "./command/index.js"

dotenv.config()

async function main() {
    program.parse(process.argv)
}

main().catch((err) => {
    console.error(err)
    process.exit(1)
})
