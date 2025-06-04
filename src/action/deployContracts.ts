import chalk from "chalk"
import ora from "ora"
import type { Address, Hex } from "viem"
import { http, createPublicClient, getAddress } from "viem"
import { createKernelClient, getZeroDevBundlerRPC } from "../clients/index.js"
import { DEPLOYER_CONTRACT_ADDRESS, type ZerodevChain } from "../constant.js"
import { ensureHex, writeErrorLogToFile } from "../utils/index.js"
import { computeContractAddress } from "./computeAddress.js"
import { DeploymentStatus, checkDeploymentOnChain } from "./findDeployment.js"

class AlreadyDeployedError extends Error {
    address: Address
    constructor(address: Address) {
        super(`Contract already deployed on Address ${address}`)
        this.name = "AlreadyDeployedError"
        this.address = address
    }
}

type DeployResult = [string, string]

export const deployToChain = async (
    privateKey: Hex,
    chain: ZerodevChain,
    bytecode: Hex,
    salt: Hex,
    expectedAddress: string | undefined,
    callGasLimit: bigint | undefined
): Promise<DeployResult> => {
    const publicClient = createPublicClient({
        chain: chain,
        transport: http()
    })
    const kernelAccountClient = await createKernelClient(privateKey, chain)

    if (!kernelAccountClient.account) {
        throw new Error("Kernel account is not initialized")
    }

    const result = await publicClient
        .call({
            account: kernelAccountClient.account.address,
            data: ensureHex(salt + bytecode.slice(2)),
            to: DEPLOYER_CONTRACT_ADDRESS
        })
        .catch(async (error: Error) => {
            const address = computeContractAddress(
                DEPLOYER_CONTRACT_ADDRESS,
                bytecode,
                salt
            )
            if (
                (await checkDeploymentOnChain(publicClient, address)) ===
                DeploymentStatus.Deployed
            ) {
                throw new AlreadyDeployedError(address)
            }
            if (
                expectedAddress &&
                expectedAddress.toLowerCase() !== address.toLowerCase()
            ) {
                throw new Error(
                    `Contract will be deployed at ${address.toLowerCase()} does not match expected address ${expectedAddress.toLowerCase()}`
                )
            }
            throw new Error(
                `Error calling contract ${DEPLOYER_CONTRACT_ADDRESS} : ${error}`
            )
        })

    if (
        expectedAddress &&
        result.data?.toLowerCase() !== expectedAddress.toLowerCase()
    ) {
        throw new Error(
            `Contract will be deployed at ${result.data?.toLowerCase()} does not match expected address ${expectedAddress.toLowerCase()}`
        )
    }
    const opHash = await kernelAccountClient.sendUserOperation({
        callData: await kernelAccountClient.account.encodeCalls([
            {
                to: DEPLOYER_CONTRACT_ADDRESS,
                value: 0n,
                data: ensureHex(salt + bytecode.slice(2))
            }
        ])
    })

    await kernelAccountClient.waitForUserOperationReceipt({
        hash: opHash
    })
    await kernelAccountClient.getUserOperationReceipt({
        hash: opHash
    })

    return [getAddress(result.data as Address), opHash]
}

export const deployContracts = async (
    privateKey: Hex,
    bytecode: Hex,
    chains: ZerodevChain[],
    salt: Hex,
    expectedAddress: string | undefined,
    callGasLimit: bigint | undefined
) => {
    const spinner = ora(
        `Deploying contract on ${chains.map((chain) => chain.name).join(", ")}`
    ).start()
    let anyError = false
    const deployments = chains.map(async (chain) => {
        return deployToChain(
            privateKey,
            chain,
            bytecode,
            salt,
            expectedAddress,
            callGasLimit
        )
            .then((result) => {
                spinner.succeed(
                    `Contract deployed at "${result[0]}" on ${chalk.blueBright(
                        chain.name
                    )} with opHash "${
                        result[1]
                    }" \n 🔗 Jiffyscan link for the transaction: https://jiffyscan.xyz/userOpHash/${
                        result[1]
                    }`
                )
                return result
            })
            .catch((error) => {
                if (error instanceof AlreadyDeployedError) {
                    spinner.warn(
                        `Contract already deployed at ${
                            error.address
                        } on ${chalk.yellowBright(chain.name)}`
                    )
                } else {
                    writeErrorLogToFile(chain.name, error)
                    anyError = true
                    spinner.fail(
                        `Deployment for ${chalk.redBright(
                            chain.name
                        )} failed! Check the error log at "./log" directory`
                    )
                }
            })
    })

    await Promise.allSettled(deployments)
    spinner.stop()
    if (anyError) {
        console.log("❌ Some deployments failed!")
        process.exit(1)
    } else {
        console.log("✅ All deployments process successfully finished!")
    }
}
