import fs from "node:fs"
import path from "node:path"
import { encodeDeployData } from "viem"

export const readBytecodeFromFile = (pathToBytecode: string): string => {
    const content = fs
        .readFileSync(path.resolve(process.cwd(), pathToBytecode), "utf8")
        .replace(/\n+$/, "")

    // Check if this is a JSON file.
    // If it is, we assume that it's a compilation artifact as outputted by Forge.
    if (pathToBytecode.endsWith(".json")) {
        try {
            const json = JSON.parse(content)
            return (
                encodeDeployData({
                    abi: json.abi,
                    bytecode: json.bytecode,
                    args: []
                    // biome-ignore lint/suspicious/noExplicitAny: reason
                }) as any
            ).object
        } catch (error) {
            console.error(
                `Error: Failed to parse JSON file ${pathToBytecode}.\nPlease ensure that this is a compilation artifact as outputted by tools such as Forge.`
            )
            console.error(error)
            process.exit(1)
        }
    } else {
        return content
    }
}

export const writeErrorLogToFile = (chainName: string, error: Error): void => {
    const logDir = path.resolve(process.cwd(), "log")

    if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true })
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
    fs.writeFileSync(
        path.join(logDir, `${chainName}_error_${timestamp}.log`),
        error.toString()
    )
}

export const clearFiles = (dir: string) => {
    const absoluteLogDir = path.resolve(process.cwd(), dir)

    for (const file of fs.readdirSync(absoluteLogDir)) {
        const filePath = path.join(absoluteLogDir, file)
        if (fs.statSync(filePath).isFile()) {
            try {
                fs.unlinkSync(filePath)
            } catch (error) {
                console.error(`Failed to delete file ${filePath}:`, error)
            }
        }
    }
}
