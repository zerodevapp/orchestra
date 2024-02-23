import { exec } from "child_process"
import util from "util"
import chalk from "chalk"
import ora from "ora"
import { Address } from "viem"
import { Chain } from "../constant"

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
    chain: Chain
): Promise<string> {
    if (
        !chain.etherscanApiKey &&
        chain.name !== "avalanche" &&
        chain.name !== "avalanche-fuji" &&
        chain.name !== "opbnb" &&
        chain.name !== "astar-zkatana"
    ) {
        throw new Error(
            `Etherscan API key is not provided for ${chalk.yellowBright(
                chain.name
            )}`
        )
    }

    if (["opbnb", "astar-zkatana"].includes(chain.name)) {
        throw new Error(
            `Verification is not supported on ${chalk.yellowBright(chain.name)}`
        )
    }

    const effectiveChainName =
        chain.name === "linea-testnet" ? "linea-goerli" : chain.name
    const command = `forge verify-contract -c ${effectiveChainName} ${contractAddress} ${contractName} -e ${chain.etherscanApiKey}`

    try {
        const { stdout, stderr } = await execPromise(command)
        if (stderr) {
            return `Error verifying contract ${contractName} at ${contractAddress} on ${chalk.yellowBright(
                chain.name
            )}: ${stderr}`
        }
        if (stdout.includes("is already verified")) {
            return `Contract ${contractName} at ${contractAddress} on ${chalk.yellowBright(
                chain.name
            )} is already verified. Skipping verification.`
        }
        return `Successfully verified contract ${contractName} at ${contractAddress} on ${chalk.yellowBright(
            chain.name
        )}.`
    } catch (error) {
        throw new Error(`Error executing ${command}: ${error}`)
    }
}

export const verifyContracts = async (
    contractName: string,
    contractAddress: Address,
    chains: Chain[]
) => {
    await checkForgeAvailability()

    const spinner = ora().start("Verifying contracts...")
    const verificationPromises = chains.map((chain) =>
        verifyContract(contractName, contractAddress, chain)
    )

    const results = await Promise.allSettled(verificationPromises)
    results.forEach((result, index) => {
        spinner.text = `Verifying contract ${contractName} on ${chains[index].name}`
        if (result.status === "fulfilled") {
            result.value.includes("is already verified")
                ? spinner.warn(result.value)
                : spinner.succeed(result.value)
        } else {
            spinner.fail(`Verification failed! ${result.reason}`)
        }
    })

    spinner.stop()
    console.log("✅ All verifications process successfully finished!")
}
