import chalk from "chalk"
import ora from "ora"
import { bundlerActions } from "permissionless"
import { ENTRYPOINT_ADDRESS_V07 } from "permissionless/utils"
import type { Address, Hex } from "viem"
import { http, createPublicClient, getAddress } from "viem"
import { createKernelClient, getZeroDevBundlerRPC } from "../clients/index.js"
import { type Chain, DEPLOYER_CONTRACT_ADDRESS } from "../constant.js"
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
    chain: Chain,
    bytecode: Hex,
    salt: Hex,
    expectedAddress: string | undefined,
    callGasLimit: bigint | undefined
): Promise<DeployResult> => {
    const publicClient = createPublicClient({
        chain: chain.viemChainObject,
        transport: http(getZeroDevBundlerRPC(chain.projectId))
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
        account: kernelAccountClient.account,
        userOperation: {
            callData: await kernelAccountClient.account.encodeCallData({
                to: DEPLOYER_CONTRACT_ADDRESS,
                value: 0n,
                data: ensureHex(salt + bytecode.slice(2))
            }),
            callGasLimit
        }
    })

    const bundlerClient = kernelAccountClient.extend(
        bundlerActions(ENTRYPOINT_ADDRESS_V07)
    )
    const userOpResult = await bundlerClient.waitForUserOperationReceipt({
        hash: opHash
    })
    if (!userOpResult.success) {
        throw new Error(
            `User operation failed with reason: ${userOpResult.reason}, User Op Hash: ${opHash}`
        )
    }
    return [getAddress(result.data as Address), opHash]
}

export const deployContracts = async (
    privateKey: Hex,
    bytecode: Hex,
    chains: Chain[],
    salt: Hex,
    expectedAddress: string | undefined,
    callGasLimit: bigint | undefined
) => {
    const spinner = ora(
        `Deploying contract on ${chains.map((chain) => chain.name).join(", ")}`
    ).start()
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
    console.log("✅ All deployments process successfully finished!")
}
