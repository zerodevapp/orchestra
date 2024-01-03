#!/usr/bin/env node
import crypto from "crypto"
import chalk from "chalk"
import Table from "cli-table3"
import { Command } from "commander"
import figlet from "figlet"
import {
    computeContractAddress,
    deployContracts,
    findDeployment,
    getDeployerAddress
} from "../action"
import { DEPLOYER_CONTRACT_ADDRESS, getSupportedChains } from "../constant"
import {
    clearFiles,
    ensureHex,
    processAndValidateChains,
    readBytecodeFromFile,
    validateInputs
} from "../utils"

export const program = new Command()

program
    .name("ZeroDev-Multichain-Deployer")
    .description(
        "tool for deploying contracts to multichain with account abstraction"
    )
    .usage("zerodev <command> [options]")
    .version("1.0.0")

program.helpInformation = function () {
    const asciiArt = chalk.blueBright(
        figlet.textSync("ZeroDev Deployer", {
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
    .action(() => {
        const chains = getSupportedChains().map((chain) => [
            chain.name,
            chain.type === "mainnet"
                ? chalk.blue(chain.type)
                : chalk.green(chain.type)
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
    .argument("<salt>", "salt to be used for create2")
    .option(
        "-f, --file <path-to-bytecode>",
        "file path of bytecode to deploy, a.k.a. init code"
    )
    .option("-b, --bytecode <bytecode>", "bytecode to deploy")
    .action(async (salt: string, options) => {
        const { file, bytecode } = options
        validateInputs(file, bytecode, salt, undefined)

        let bytecodeToDeploy = bytecode
        if (file) {
            bytecodeToDeploy = readBytecodeFromFile(file)
        }

        const address = computeContractAddress(
            DEPLOYER_CONTRACT_ADDRESS,
            ensureHex(bytecodeToDeploy),
            ensureHex(salt)
        )
        console.log(`computed address: ${address}`)
    })

program
    .command("get-deployer-address")
    .description("Get the deployer's address")
    .action(async () => {
        const address = getDeployerAddress(0n)
        console.log(`deployer address: ${address}`)
    })

program
    .command("deploy")
    .description(
        "Deploy contracts deterministically using CREATE2, in order of the chains specified"
    )
    .argument("<salt>", "salt to be used for CREATE2")
    .option(
        "-f, --file <path-to-bytecode>",
        "file path of bytecode to deploy, a.k.a. init code"
    )
    .option("-b, --bytecode <bytecode>", "bytecode to deploy")
    .option("-t, --testnet-all", "select all testnets", false)
    .option("-m, --mainnet-all", "select all mainnets", false)
    .option(
        "-c, --chains [CHAINS]",
        "list of chains for deploying contracts, with all selected by default",
        "all"
    )
    .option("-e, --expected-address [ADDRESS]", "expected address to confirm")
    .action((salt: string, options) => {
        const {
            file,
            bytecode,
            testnetAll,
            mainnetAll,
            chains,
            expectedAddress
        } = options

        validateInputs(file, bytecode, salt, expectedAddress)
        const chainObjects = processAndValidateChains(chains, {
            testnetAll,
            mainnetAll
        })

        let bytecodeToDeploy = bytecode
        if (file) {
            bytecodeToDeploy = readBytecodeFromFile(file)
        }

        deployContracts(
            ensureHex(bytecodeToDeploy),
            chainObjects,
            ensureHex(salt),
            expectedAddress
        )
    })

/** @notice 400 error on base-sepolia */
program
    .command("check-deployment")
    .description(
        "check whether the contract has already been deployed on the specified networks"
    )
    .argument("<salt>", "salt used for depolyment")
    .option(
        "-f, --file <path-to-bytecode>",
        "file path of bytecode to deploy, a.k.a. init code"
    )
    .option("-b, --bytecode <bytecode>", "bytecode to deploy")
    .option(
        "-c, --chains [CHAINS]",
        "list of chains to check, with all selected by default",
        "all"
    )
    .option("-t, --testnet-all", "select all testnets", false)
    .option("-m, --mainnet-all", "select all mainnets", false)
    .action(async (salt: string, options) => {
        const { file, bytecode, chains, testnetAll, mainnetAll } = options

        validateInputs(file, bytecode, salt, undefined)
        const chainObjects = processAndValidateChains(chains, {
            testnetAll,
            mainnetAll
        })

        let bytecodeToDeploy = bytecode
        if (file) {
            bytecodeToDeploy = readBytecodeFromFile(file)
        }

        const { address, deployedChains, notDeployedChains } =
            await findDeployment(
                ensureHex(bytecodeToDeploy),
                ensureHex(salt),
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
    .command("clear-log")
    .description("clear the log files")
    .action(() => {
        clearFiles("./log")
        console.log("done!")
    })

program
    .command("generate-salt")
    .description(
        "generate a random 32 bytes salt, or convert the input to salt"
    )
    .option("-i, --input <input>", "input to be converted to salt")
    .action((options) => {
        let salt
        if (options.input) {
            const inputNum = BigInt(options.input)
            salt = inputNum.toString(16).padStart(64, "0") // pad the input with zeros to make it 32 bytes
        } else {
            salt = crypto.randomBytes(32).toString("hex")
        }
        console.log(`Generated salt: ${ensureHex(salt)}`)
    })
