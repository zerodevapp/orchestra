import fs from "fs"
import path from "path"

export const readBytecodeFromFile = (pathToBytecode: string): string => {
    return fs
        .readFileSync(path.resolve(process.cwd(), pathToBytecode), "utf8")
        .replace(/\n+$/, "")
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
