import chalk from "chalk"
import { SmartAccountClient } from "permissionless"
import {
    http,
    Address,
    Hex,
    PublicClient,
    createPublicClient,
    getAddress
} from "viem"
import { createKernelAccountClient, getZeroDevBundlerRPC } from "../clients"
import { Chain, DEPLOYER_CONTRACT_ADDRESS } from "../constant"
import { ensureHex, writeErrorLogToFile } from "../utils"
import { computeContractAddress } from "./computeAddress"
import { DeploymentStatus, checkDeploymentOnChain } from "./findDeployment"

class AlreadyDeployedError extends Error {
    address: Address
    constructor(address: Address) {
        super(`Contract already deployed on Address ${address}`)
        this.name = "AlreadyDeployedError"
        this.address = address
    }
}

export const deployToChain = async (
    kernelAccountClient: SmartAccountClient,
    publicClient: PublicClient,
    bytecode: Hex,
    salt: Hex,
    expectedAddress: string | undefined
): Promise<[string, string]> => {
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
            throw new Error(
                `Error calling contract ${DEPLOYER_CONTRACT_ADDRESS} : ${error}`
            )
        })

    if (expectedAddress && result.data !== expectedAddress) {
        throw new Error(
            `Contract will be deployed at ${result.data} does not match expected address ${expectedAddress}`
        )
    }

    const opHash = await kernelAccountClient.sendUserOperation({
        account: kernelAccountClient.account,
        userOperation: {
            callData: await kernelAccountClient.account.encodeCallData({
                to: DEPLOYER_CONTRACT_ADDRESS,
                value: 0n,
                data: ensureHex(salt + bytecode.slice(2))
            })
        }
    })
    return [getAddress(result.data as Address), opHash]
}

// Update console with deployment status, note that this clears the console and you cannot use console.log to print anything else
const updateConsole = (
    chains: Chain[],
    deploymentStatus: Record<
        string,
        { status: string; result?: string; opHash?: string }
    >,
    frames: string[],
    frameIndex: number
) => {
    console.clear()
    console.log("🏁 Starting deployments...")
    for (const chain of chains) {
        const frame =
            deploymentStatus[chain.name].status === "starting..."
                ? chalk.green(frames[frameIndex])
                : ""
        if (deploymentStatus[chain.name].status === "done!") {
            console.log(
                `🟢 Contract deployed at ${
                    deploymentStatus[chain.name].result
                } on ${chain.name} with userOp hash ${
                    deploymentStatus[chain.name].opHash
                }`
            )
            console.log(
                `🔗 Jiffyscan link for the transaction: https://jiffyscan.xyz/userOpHash/${
                    deploymentStatus[chain.name].opHash
                }`
            )
        } else if (deploymentStatus[chain.name].status === "already deployed") {
            console.log(
                `🟡 Contract already deployed at ${
                    deploymentStatus[chain.name].result
                } on ${chain.name}`
            )
        } else if (deploymentStatus[chain.name].status.startsWith("failed!")) {
            console.log(
                `❌ ${frame} Deployment for ${chain.name} is ${
                    deploymentStatus[chain.name].status
                }`
            )
        } else {
            console.log(
                `${frame} Deployment for ${chain.name} is ${
                    deploymentStatus[chain.name].status
                }`
            )
        }
    }
}

export const deployToChainAndUpdateStatus = async (
    kernelAccountClient: SmartAccountClient,
    publicClient: PublicClient,
    chain: Chain,
    bytecode: Hex,
    salt: Hex,
    expectedAddress: string | undefined,
    deploymentStatus: Record<
        string,
        { status: string; result?: string; opHash?: string }
    >
) => {
    try {
        const [result, opHash] = await deployToChain(
            kernelAccountClient,
            publicClient,
            bytecode,
            salt,
            expectedAddress
        )
        deploymentStatus[chain.name] = { status: "done!", result, opHash }
    } catch (error) {
        if (error instanceof AlreadyDeployedError) {
            deploymentStatus[chain.name] = {
                status: "already deployed",
                result: error.address
            }
        } else {
            deploymentStatus[chain.name] = {
                status: `failed! check the error log at "./log" directory`
            }
            const errorInstance =
                error instanceof Error ? error : new Error(String(error))
            writeErrorLogToFile(chain.name, errorInstance)
        }
    }
}

export const deployContracts = async (
    bytecode: Hex,
    chains: Chain[],
    salt: Hex,
    expectedAddress: string | undefined
) => {
    const deploymentStatus: Record<
        string,
        { status: string; result?: string; opHash?: string }
    > = {}
    for (const chain of chains) {
        deploymentStatus[chain.name] = { status: "starting..." }
    }

    const frames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"]
    let frameIndex = 0

    const interval = setInterval(
        () =>
            updateConsole(
                chains,
                deploymentStatus,
                frames,
                frameIndex++ % frames.length
            ),
        100
    )
    const deployments = []
    for (const chain of chains) {
        try {
            const kernelAccount = await createKernelAccountClient(chain)
            const publicClient = createPublicClient({
                chain: chain.viemChainObject,
                transport: http(getZeroDevBundlerRPC(chain.projectId))
            })
            deployments.push(
                deployToChainAndUpdateStatus(
                    kernelAccount,
                    publicClient,
                    chain,
                    bytecode,
                    salt,
                    expectedAddress,
                    deploymentStatus
                )
            )
        } catch (error) {
            const errorInstance =
                error instanceof Error ? error : new Error(String(error))
            writeErrorLogToFile(chain.name, errorInstance)
            deploymentStatus[chain.name] = {
                status: `failed! check the error log at "./log" directory`
            }
        }
    }

    await Promise.all(deployments)

    clearInterval(interval)
    updateConsole(chains, deploymentStatus, frames, 0) // Final update
    console.log("🏁 All deployments process successfully finished!")
}
