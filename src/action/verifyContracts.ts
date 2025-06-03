import { exec } from "node:child_process"
import util from "node:util"
import chalk from "chalk"
import ora from "ora"
import type { Address } from "viem"
import type { ZerodevChain } from "../constant.js"

const execPromise = util.promisify(exec)

async function checkForgeAvailability() {
    try {
        await execPromise("forge --version")
    } catch {
        throw new Error(
            "forge command is not available, please install forge to verify contracts. https://book.getfoundry.sh/getting-started/installation"
        )
    }
}

async function verifyContract(
    contractName: string,
    contractAddress: Address,
    chain: ZerodevChain
): Promise<string> {
    // if (
    //     !chain.etherscanApiKey &&
    //     chain.name !== "avalanche" &&
    //     chain.name !== "avalanche-fuji" &&
    //     chain.name !== "opbnb" &&
    //     chain.name !== "astar-zkatana"
    // ) {
    //     throw new Error(
    //         `Etherscan API key is not provided for ${chalk.yellowBright(
    //             chain.name
    //         )}`
    //     )
    // }

    // if (["opbnb", "astar-zkatana"].includes(chain.name)) {
    //     throw new Error(
    //         `Verification is not supported on ${chalk.yellowBright(chain.name)}`
    //     )
    // }

    // const effectiveChainName =
    //     chain.name === "linea-testnet" ? "linea-goerli" : chain.name
    // const command = `forge verify-contract -c ${effectiveChainName} ${contractAddress} ${contractName} -e ${chain.etherscanApiKey}`

    // try {
    //     const { stdout, stderr } = await execPromise(command)
    //     if (stderr) {
    //         return `Error verifying contract ${contractName} at ${contractAddress} on ${chalk.yellowBright(
    //             chain.name
    //         )}: ${stderr}`
    //     }
    //     if (stdout.includes("is already verified")) {
    //         return `Contract ${contractName} at ${contractAddress} on ${chalk.yellowBright(
    //             chain.name
    //         )} is already verified. Skipping verification.`
    //     }
    //     return `Successfully verified contract ${contractName} at ${contractAddress} on ${chalk.yellowBright(
    //         chain.name
    //     )}.`
    // } catch (error) {
    //     throw new Error(`Error executing ${command}: ${error}`)
    // }
    return ""
}

export const verifyContracts = async (
    contractName: string,
    contractAddress: Address,
    chains: ZerodevChain[]
) => {
    // await checkForgeAvailability()
    // const spinner = ora().start("Verifying contracts...")
    // const verificationPromises = chains.map((chain) =>
    //     verifyContract(contractName, contractAddress, chain)
    //         .then((message) => {
    //             if (message.includes("is already verified")) {
    //                 ora().warn(message).start().stop()
    //             } else {
    //                 ora().succeed(message).start().stop()
    //             }
    //         })
    //         .catch((error) => {
    //             ora()
    //                 .fail(
    //                     `Verification failed on ${chain.name}: ${error.message}`
    //                 )
    //                 .start()
    //                 .stop()
    //         })
    // )
    // // Wait for all verifications to complete
    // await Promise.all(verificationPromises)
    // spinner.stop()
    // console.log("✅ All verifications process successfully finished!")
}
