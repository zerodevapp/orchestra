import type { Hex } from "viem"
import { type ZerodevChain, getSupportedChains } from "../constant.js"
import { readBytecodeFromFile } from "./file.js"

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
    allNetworks?: boolean
    chainOption?: string
}

export const processAndValidateChains = async (
    options: CommandOptions
): Promise<ZerodevChain[]> => {
    const supportedChains = await getSupportedChains()

    // Check for mutually exclusive options
    const exclusiveOptions = [
        options.chainOption !== undefined,
        options.testnetAll,
        options.mainnetAll,
        options.allNetworks
    ]
    const selectedOptionsCount = exclusiveOptions.filter(
        (isSelected) => isSelected
    ).length

    if (selectedOptionsCount === 0) {
        console.error(
            "Error: At least one of -c, -t, -m, -a options must be specified"
        )
        process.exit(1)
    } else if (selectedOptionsCount > 1) {
        console.error(
            "Error: Options -c, -t, -m, -a are mutually exclusive and cannot be used together"
        )
        process.exit(1)
    }

    let chains: ZerodevChain[]
    if (options.testnetAll) {
        chains = supportedChains.filter((chain) => chain.testnet)
    } else if (options.mainnetAll) {
        chains = supportedChains.filter((chain) => !chain.testnet)
    } else if (options.allNetworks) {
        chains = supportedChains
    } else if (options.chainOption) {
        const chainNames = options.chainOption
            ? options.chainOption.split(",")
            : []

        chains = chainNames
            .map((chainName) =>
                supportedChains.find(
                    (chain) =>
                        chain.name.toLowerCase() === chainName.toLowerCase()
                )
            )
            .filter((chain) => chain !== undefined)
    } else {
        console.error(
            "Error: At least one of -c, -t, -m, -a options must be specified"
        )
        process.exit(1)
    }
    return chains
}
