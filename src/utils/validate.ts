import { Hex } from "viem"
import { Chain, UnvalidatedChain, getSupportedChains } from "../constant"
import { readBytecodeFromFile } from "./file"

const PRIVATE_KEY_REGEX = /^0x[0-9a-fA-F]{64}$/
const BYTECODE_REGEX = /^0x[0-9a-fA-F]*$/
const SALT_REGEX = /^0x[0-9a-fA-F]{64}$/
const ADDRESS_REGEX = /^0x[0-9a-fA-F]{40}$/

export const validatePrivateKey = (privateKey: Hex | null): Hex => {
    if (!privateKey) {
        console.error("Error: This command requires a private key")
        process.exit(1)
    }
    if (!PRIVATE_KEY_REGEX.test(privateKey)) {
        console.error("Error: Private key must be a 32 bytes hex string")
        process.exit(1)
    }
    return privateKey
}

export const validateInputs = (
    filePath: string | undefined,
    bytecode: string | undefined,
    salt: string,
    expectedAddress: string | undefined
) => {
    if (!filePath && !bytecode) {
        console.error("Error: Either filePath or bytecode must be specified")
        process.exit(1)
    }

    if (filePath && bytecode) {
        console.error(
            "Error: Only one of filePath and bytecode can be specified"
        )
        process.exit(1)
    }

    const bytecodeToValidate = filePath
        ? readBytecodeFromFile(filePath)
        : bytecode

    if (!bytecodeToValidate) {
        console.error("Error: Bytecode must be specified")
        process.exit(1)
    }

    if (
        !BYTECODE_REGEX.test(bytecodeToValidate) ||
        bytecodeToValidate.length % 2 !== 0
    ) {
        console.error("Error: Bytecode must be a hexadecimal string")
        process.exit(1)
    }

    if (!SALT_REGEX.test(salt)) {
        console.error("Error: Salt must be a 32 bytes hex string")
        process.exit(1)
    }

    if (expectedAddress && !ADDRESS_REGEX.test(expectedAddress)) {
        console.error("Error: Expected address must be a 20 bytes hex string")
        process.exit(1)
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
    if (chainOption.length !== 0 && options.mainnetAll && options.testnetAll) {
        console.error("Error: Cannot use more than one of -c, -t, -m options")
        process.exit(1)
    }

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

    const chainObjects: UnvalidatedChain[] = chains.map((chainName: string) => {
        const chain = supportedChains.find((c) => c.name === chainName)
        if (!chain) {
            console.error(`Error: Chain ${chainName} is not supported`)
            process.exit(1)
        }
        return chain
    })

    return validateChains(chainObjects)
}

const validateChains = (chains: UnvalidatedChain[]): Chain[] => {
    return chains.map((chain) => {
        if (!chain.projectId) {
            console.error(
                `Error: PROJECT_ID for chain ${chain.name} is not specified`
            )
            process.exit(1)
        }
        return chain as Chain
    })
}
