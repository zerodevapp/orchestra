import dotenv from "dotenv"
import { program } from "./command"

dotenv.config()

async function main() {
    program.parse(process.argv)
}

if (require.main === module) {
    main().catch((err) => {
        console.error(err)
        process.exit(1)
    })
}
