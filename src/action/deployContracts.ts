import chalk from "chalk"
import { Hex, createPublicClient, getAddress } from "viem"

import { createSmartAccountClient } from "permissionless"
import { signerToEcdsaKernelSmartAccount } from "permissionless/accounts"
import { privateKeyToAccount } from "viem/accounts"
import { createZeroDevClient } from "../clients"
import { createZeroDevPaymasterClient } from "../clients/ZeroDevClient"
import { PRIVATE_KEY } from "../config"
import { Chain, DEPLOYER_CONTRACT_ADDRESS, ENTRYPOINT } from "../constant"
import { ensureHex, writeErrorLogToFile } from "../utils"
import { Address } from "wagmi"
import { computeContractAddress } from "./computeAddress"

class AlreadyDeployedError extends Error {
    address: Address
    constructor(address: Address, chainName: string) {
        super(
            `Contract already deployed on Address ${address} for chain ${chainName}`
        )
        this.name = "AlreadyDeployedError"
        this.address = address
    }
}

const deployToChain = async (
    chain: Chain,
    bytecode: Hex,
    salt: Hex,
    expectedAddress: string | undefined
): Promise<[string, string]> => {
    if (chain.projectId === null) {
        throw new Error(`PROJECT_ID for chain ${chain.name} is not specified`)
    }

    const publicClient = createPublicClient({
        chain: chain.viemChainObject,
        // zerodev bundler supports both public and bundler rpc
        transport: createZeroDevClient("bundler", chain.projectId)
    })

    const paymasterClient = createZeroDevPaymasterClient({
        chain: chain.viemChainObject,
        transport: createZeroDevClient("paymaster", chain.projectId)
    })

    const signer = privateKeyToAccount(ensureHex(PRIVATE_KEY))

    const kernelAccount = await signerToEcdsaKernelSmartAccount(publicClient, {
        entryPoint: ENTRYPOINT,
        signer: signer,
        index: 0n
    })

    const smartAccountClient = createSmartAccountClient({
        account: kernelAccount,
        chain: chain.viemChainObject,
        transport: createZeroDevClient("bundler", chain.projectId),
        sponsorUserOperation: paymasterClient.sponsorUserOperation
    })

    const result = await publicClient
        .call({
            account: kernelAccount.address,
            data: ensureHex(salt + bytecode.slice(2)),
            to: DEPLOYER_CONTRACT_ADDRESS
        })
        .catch(async (error: Error) => {
            const address = computeContractAddress(
                DEPLOYER_CONTRACT_ADDRESS,
                bytecode,
                salt
            )
            if ((await publicClient.getBytecode({ address })) !== "0x") {
                throw new AlreadyDeployedError(address, chain.name)
            }
            throw new Error(
                `Error calling contract ${DEPLOYER_CONTRACT_ADDRESS} on ${chain.name}: ${error}`
            )
        })

    if (expectedAddress && result.data !== expectedAddress) {
        throw new Error(
            `Contract will be deployed at ${result.data} on ${chain} does not match expected address ${expectedAddress}`
        )
    }

    const op = await smartAccountClient.prepareUserOperationRequest({
        account: kernelAccount,
        userOperation: {
            callData: await kernelAccount.encodeCallData({
                to: DEPLOYER_CONTRACT_ADDRESS,
                data: ensureHex(salt + bytecode.slice(2)),
                value: 0n
            })
        }
    })

    const opHash = await smartAccountClient.sendUserOperation({
        account: kernelAccount,
        userOperation: op
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

const deployToChainAndUpdateStatus = async (
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
            chain,
            bytecode,
            salt,
            expectedAddress
        )
        deploymentStatus[chain.name] = { status: "done!", result, opHash }
    } catch (error) {
        if (error instanceof AlreadyDeployedError) {
            deploymentStatus[chain.name] = {
                status: `already deployed`,
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

    const deployments = chains.map((chain) =>
        deployToChainAndUpdateStatus(
            chain,
            bytecode,
            salt,
            expectedAddress,
            deploymentStatus
        )
    )

    await Promise.all(deployments)

    clearInterval(interval)
    updateConsole(chains, deploymentStatus, frames, 0) // Final update
    console.log("🏁 All deployments process successfully finished!")
}
