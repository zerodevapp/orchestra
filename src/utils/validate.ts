import { Chain, getSupportedChains } from "../constant"
import { readBytecodeFromFile } from "./file"

const BYTECODE_REGEX = /^0x[0-9a-fA-F]*$/
const SALT_REGEX = /^0x[0-9a-fA-F]{64}$/
const ADDRESS_REGEX = /^0x[0-9a-fA-F]{40}$/

export const validateInputs = (
    filePath: string | undefined,
    bytecode: string | undefined,
    salt: string,
    expectedAddress: string | undefined
) => {
    if (!filePath && !bytecode) {
        throw new Error("Either filePath or bytecode must be specified")
    }

    if (filePath && bytecode) {
        throw new Error("Only one of filePath and bytecode can be specified")
    }

    if (filePath && !BYTECODE_REGEX.test(readBytecodeFromFile(filePath))) {
        throw new Error("Bytecode must be a hexadecimal string")
    }

    if (bytecode && !BYTECODE_REGEX.test(bytecode)) {
        throw new Error("Bytecode must be a hexadecimal string")
    }

    if (!SALT_REGEX.test(salt)) {
        throw new Error("Salt must be a 32 bytes hex string")
    }

    if (expectedAddress && !ADDRESS_REGEX.test(expectedAddress)) {
        throw new Error("Expected address must be a 20 bytes hex string")
    }
}

interface CommandOptions {
    testnetAll?: boolean
    mainnetAll?: boolean
}

export const processAndValidateChains = (
    chainOption: string,
    options: CommandOptions
): Chain[] => {
    const supportedChains = getSupportedChains()

    let chains: string[]
    if (options.testnetAll) {
        chains = supportedChains
            .filter((chain) => chain.type === "testnet")
            .map((chain) => chain.name)
    } else if (options.mainnetAll) {
        chains = supportedChains
            .filter((chain) => chain.type === "mainnet")
            .map((chain) => chain.name)
    } else {
        chains =
            chainOption === "all"
                ? supportedChains.map((chain) => chain.name)
                : chainOption.split(",")
    }

    const chainObjects: Chain[] = chains.map((chainName: string) => {
        const chain = supportedChains.find((c) => c.name === chainName)
        if (!chain) throw new Error(`Chain ${chainName} is not supported`)
        return chain
    })

    validateChains(chainObjects)
    return chainObjects
}

const validateChains = (chains: Chain[]) => {
    for (const chain of chains) {
        if (!chain.projectId) {
            throw new Error(
                `PROJECT_ID for chain ${chain.name} is not specified`
            )
        }
    }
}
