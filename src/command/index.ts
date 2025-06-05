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

// Common options
const chainSelectionOptions: CommandOption[] = [
    {
        flags: "-t, --testnet-all",
        description: "select all testnets",
        defaultValue: false
    },
    {
        flags: "-m, --mainnet-all",
        description: "select all mainnets",
        defaultValue: false
    },
    {
        flags: "-a, --all-networks",
        description: "select all networks",
        defaultValue: false
    },
    { flags: "-c, --chains [CHAINS]", description: "list of chains to deploy" }
]

const codeOptions: CommandOption[] = [
    {
        flags: "-f, --file <path-to-bytecode>",
        description:
            "file path of bytecode to deploy, a.k.a. init code, or a JSON file containing the bytecode of the contract (such as the output file by Forge), in which case it's assumed that the constructor takes no arguments."
    },
    { flags: "-b, --bytecode <bytecode>", description: "bytecode to deploy" },
    {
        flags: "-s, --salt <salt>",
        description:
            "salt to be used for CREATE2. This can be a full 32-byte hex string or a shorter numeric representation that will be converted to a 32-byte hex string."
    }
]

const deployOptions: CommandOption[] = [
    {
        flags: "-e, --expected-address [ADDRESS]",
        description: "expected address to confirm"
    },
    {
        flags: "-v, --verify-contract [CONTRACT_NAME]",
        description: "verify the deployment on Etherscan"
    },
    {
        flags: "-g, --call-gas-limit <call-gas-limit>",
        description: "gas limit for the call"
    }
]

const mirrorOption: CommandOption = {
    flags: "-f, --from-chain <chain>",
    description: "source chain to mirror from"
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
    .name("zerodev")
    .description(
        "tool for deploying contracts to multichain with account abstraction"
    )
    .usage("<command> [options]")
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
    .description(
        "Deploy contracts deterministically using CREATE2, in order of the chains specified"
    )
    .addOptions([...codeOptions, ...deployOptions, ...chainSelectionOptions])
    .action(async (options) => {
        const {
            file,
            bytecode,
            salt,
            testnetAll,
            mainnetAll,
            allNetworks,
            chains,
            expectedAddress,
            verifyContract,
            callGasLimit
        } = options

        const normalizedSalt = normalizeSalt(salt)

        validateInputs(file, bytecode, normalizedSalt, expectedAddress)
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

        await deployContracts(
            validatePrivateKey(PRIVATE_KEY),
            ensureHex(bytecodeToDeploy),
            chainObjects,
            ensureHex(normalizedSalt),
            expectedAddress,
            callGasLimit ? BigInt(callGasLimit) : undefined
        )

        console.log("✅ Contracts deployed successfully!")

        if (verifyContract) {
            console.log("Verifying contracts on Etherscan...")
            await verifyContracts(
                verifyContract,
                computeContractAddress(
                    DEPLOYER_CONTRACT_ADDRESS,
                    ensureHex(bytecodeToDeploy),
                    ensureHex(normalizedSalt)
                ),
                chainObjects
            )
        }

        console.log("✅ Contracts verified successfully!")
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

program
    .command("mirror")
    .description("Mirror a contract from one chain to other chains")
    .addOptions([mirrorOption, ...chainSelectionOptions])
    .argument("<contract-address>", "contract address to mirror")
    .action(async (contractAddress, options) => {
        const { fromChain, testnetAll, mainnetAll, allNetworks, chains } =
            options

        if (!fromChain) {
            console.error("Error: Source chain must be specified")
            process.exit(1)
        }

        if (!contractAddress) {
            console.error("Error: Contract address must be specified")
            process.exit(1)
        }

        const targetChains = await processAndValidateChains({
            testnetAll,
            mainnetAll,
            allNetworks,
            chainOption: chains
        })

        // Get the source chain object
        const sourceChain = (await getSupportedChains()).find(
            (chain) => chain.name.toLowerCase() === fromChain.toLowerCase()
        )

        if (!sourceChain) {
            console.error(`Error: Source chain ${fromChain} not found`)
            process.exit(1)
        }

        // Fetch contract data from Etherscan
        const creationResponse = await fetch(
            `https://api.etherscan.io/v2/api?chainid=${sourceChain.id}&module=contract&action=getcontractcreation&contractaddresses=${contractAddress}&apikey=${sourceChain.explorerAPI}`
        )

        const creationData =
            (await creationResponse.json()) as EtherscanContractCreationResponse
        if (creationData.status !== "1" || !creationData.result?.[0]) {
            console.error("Error: Failed to fetch contract data from Etherscan")
            process.exit(1)
        }

        const contractData = creationData.result[0]
        if (contractData.contractFactory !== DEPLOYER_CONTRACT_ADDRESS) {
            console.error(
                "Error: Contract was not deployed using the deterministic deployer"
            )
            process.exit(1)
        }

        // Since we can't get the salt from the internal transaction directly,
        // we'll need to get it from the original transaction's input data
        const originalTxResponse = await fetch(
            `https://api.etherscan.io/v2/api?chainid=${sourceChain.id}&module=proxy&action=eth_getTransactionByHash&txhash=${contractData.txHash}&apikey=${sourceChain.explorerAPI}`
        )

        const originalTxData =
            (await originalTxResponse.json()) as EtherscanTransactionResponse
        if (!originalTxData.result?.input) {
            console.error("Error: Could not get the original transaction data")
            process.exit(1)
        }

        // Extract salt from input data (first 32 bytes after the function selector)
        const salt = `0x${originalTxData.result.input.slice(2, 66)}` // Skip 0x and 4 bytes of function selector

        // Deploy the contract to target chains
        await deployContracts(
            validatePrivateKey(PRIVATE_KEY),
            ensureHex(contractData.creationBytecode),
            targetChains,
            ensureHex(salt),
            contractAddress,
            undefined
        )

        console.log("✅ Contracts mirrored successfully!")
    })

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
