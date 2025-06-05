#!/usr/bin/env node
import crypto from "node:crypto"
import { readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import chalk from "chalk"
import Table from "cli-table3"
import { Command } from "commander"
import figlet from "figlet"
import {
    computeContractAddress,
    deployContracts,
    findDeployment,
    getDeployerAddress,
    verifyContracts
} from "../action/index.js"
import { mirrorContract } from "../action/mirror.js"
import { PRIVATE_KEY } from "../config.js"
import { DEPLOYER_CONTRACT_ADDRESS, getSupportedChains } from "../constant.js"
import {
    clearFiles,
    ensureHex,
    normalizeSalt,
    processAndValidateChains,
    readBytecodeFromFile,
    validateInputs,
    validatePrivateKey
} from "../utils/index.js"
import { mirrorCommand } from "./mirror.js"
import {
    chainSelectionOptions,
    codeOptions,
    deployOptions,
    mirrorOption
} from "./options.js"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const packageJson = JSON.parse(
    readFileSync(join(__dirname, "../../package.json"), "utf8")
)
const version = packageJson.version

// Define proper types for command options
type CommandOption = {
    flags: string
    description: string
    defaultValue?: string | boolean | string[] | undefined
}

// Extend Command class to add fluent API
declare module "commander" {
    interface Command {
        addOptions(options: CommandOption[]): Command
    }
}

Command.prototype.addOptions = function (options: CommandOption[]) {
    for (const option of options) {
        this.option(option.flags, option.description, option.defaultValue)
    }
    return this
}

interface EtherscanContractCreationResponse {
    status: string
    message: string
    result: Array<{
        contractAddress: string
        contractCreator: string
        txHash: string
        blockNumber: string
        timestamp: string
        contractFactory: string
        creationBytecode: string
    }>
}

interface EtherscanTransactionResponse {
    jsonrpc: string
    id: number
    result: {
        blockHash: string
        blockNumber: string
        from: string
        gas: string
        gasPrice: string
        hash: string
        input: string
        nonce: string
        to: string
        transactionIndex: string
        value: string
        type: string
        v: string
        r: string
        s: string
    }
}

export const program = new Command()

program
    .name("orchestra")
    .description("CLI tool for deploying contracts to multiple chains")
    .version(version)

program.helpInformation = function () {
    const asciiArt = chalk.blueBright(
        figlet.textSync("ZeroDev Orchestra", {
            horizontalLayout: "default",
            verticalLayout: "default",
            width: 100,
            whitespaceBreak: true
        })
    )

    const originalHelpInformation = Command.prototype.helpInformation.call(this)
    return `\n\n${asciiArt}\n\n\n${originalHelpInformation}`
}

program
    .command("chains")
    .description("Show the list of available chains")
    .action(async () => {
        const chains = (await getSupportedChains()).map((chain) => [
            chain.name,
            chain.testnet ? chalk.green("testnet") : chalk.blue("mainnet")
        ])

        const table = new Table({
            head: ["Name", "Type"],
            chars: { mid: "", "left-mid": "", "mid-mid": "", "right-mid": "" }
        })

        for (const chain of chains) {
            table.push(chain)
        }

        console.log("[Available chains]")
        console.log(table.toString())
    })

program
    .command("compute-address")
    .description("Compute the address to be deployed")
    .addOptions([...codeOptions])
    .action(async (options) => {
        const { file, bytecode, salt } = options

        const normalizedSalt = normalizeSalt(salt)
        validateInputs(file, bytecode, normalizedSalt, undefined)

        let bytecodeToDeploy = bytecode
        if (file) {
            bytecodeToDeploy = readBytecodeFromFile(file)
        }

        const address = computeContractAddress(
            DEPLOYER_CONTRACT_ADDRESS,
            ensureHex(bytecodeToDeploy),
            ensureHex(normalizedSalt)
        )
        console.log(`computed address: ${address}`)
    })

program
    .command("get-deployer-address")
    .description("Get the deployer's address")
    .action(async () => {
        const address = getDeployerAddress(validatePrivateKey(PRIVATE_KEY), 0n)
        console.log(`deployer address: ${address}`)
    })

program
    .command("deploy")
    .description("Deploy contracts to multiple chains")
    .addOptions([...chainSelectionOptions, ...codeOptions, ...deployOptions])
    .action(async (options) => {
        try {
            validatePrivateKey(PRIVATE_KEY)
            const chains = await getSupportedChains()
            if (chains.length === 0) {
                throw new Error("No chains selected")
            }

            console.log(
                "Selected chains:",
                chains.map((chain) => chain.name).join(", ")
            )

            let bytecode: string
            if (options.file) {
                bytecode = readFileSync(options.file, "utf-8")
            } else if (options.bytecode) {
                bytecode = options.bytecode
            } else {
                throw new Error("Either --file or --bytecode must be provided")
            }

            if (!bytecode.startsWith("0x")) {
                bytecode = `0x${bytecode}`
            }

            await deployContracts(
                validatePrivateKey(PRIVATE_KEY),
                bytecode as `0x${string}`,
                chains,
                options.salt,
                options.expectedAddress,
                options.callGasLimit ? BigInt(options.callGasLimit) : undefined
            )
            console.log("✅ Contracts deployed successfully!")
        } catch (error) {
            console.error(
                error instanceof Error
                    ? error.message
                    : "Unknown error occurred"
            )
            process.exit(1)
        }
    })

program
    .command("check-deployment")
    .description(
        "check whether the contract has already been deployed on the specified networks"
    )
    .addOptions([...codeOptions, ...chainSelectionOptions])
    .action(async (options) => {
        const {
            file,
            bytecode,
            salt,
            testnetAll,
            mainnetAll,
            allNetworks,
            chains
        } = options

        const normalizedSalt = normalizeSalt(salt)
        validateInputs(file, bytecode, normalizedSalt, undefined)
        const chainObjects = await processAndValidateChains({
            testnetAll,
            mainnetAll,
            allNetworks,
            chainOption: chains
        })

        let bytecodeToDeploy = bytecode
        if (file) {
            bytecodeToDeploy = readBytecodeFromFile(file)
        }

        const { address, deployedChains, notDeployedChains } =
            await findDeployment(
                ensureHex(bytecodeToDeploy),
                ensureHex(normalizedSalt),
                chainObjects
            )

        console.log(`contract address: ${address}`)
        console.log("deployed on:")
        for (const chain of deployedChains) {
            console.log(`- ${chain.name}`)
        }
        console.log("not deployed on:")
        for (const chain of notDeployedChains) {
            console.log(`- ${chain.name}`)
        }
    })

// Add mirror command
mirrorCommand(program)

program
    .command("clear-log")
    .description("clear the log files")
    .action(() => {
        clearFiles("./log")
        console.log("✅ Log files are cleared!")
    })

program
    .command("generate-salt")
    .description(
        "generate a random 32 bytes salt, or convert the numeric input to salt"
    )
    .option("-i, --input <input>", "input to convert to salt")
    .action((options) => {
        let salt: string
        if (options.input) {
            const inputNum = BigInt(options.input)
            salt = inputNum.toString(16).padStart(64, "0") // pad the input with zeros to make it 32 bytes
        } else {
            salt = crypto.randomBytes(32).toString("hex")
        }
        console.log(`Generated salt: ${ensureHex(salt)}`)
    })

program
    .command("mirror")
    .description("Mirror a contract from one chain to other chains")
    .addOptions([mirrorOption, ...chainSelectionOptions])
    .argument("<contract-address>", "contract address to mirror")
    .action(async (contractAddress, options) => {
        try {
            await mirrorContract(contractAddress, options)
            console.log("✅ Contracts mirrored successfully!")
        } catch (error) {
            console.error(
                error instanceof Error
                    ? error.message
                    : "Unknown error occurred"
            )
            process.exit(1)
        }
    })

program.parse()
