import chalk from "chalk"
import ora from "ora"
import { SmartAccountClient } from "permissionless"
import {
    http,
    Address,
    Hex,
    PublicClient,
    createPublicClient,
    getAddress
} from "viem"
import {
    createKernelAccountClient,
    getZeroDevBundlerRPC
} from "../clients/index.js"
import { Chain, DEPLOYER_CONTRACT_ADDRESS } from "../constant.js"
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
            })
        }
    })
    return [getAddress(result.data as Address), opHash]
}

export const deployContracts = async (
    privateKey: Hex,
    bytecode: Hex,
    chains: Chain[],
    salt: Hex,
    expectedAddress: string | undefined
) => {
    const spinner = ora(
        `Deploying contract on ${chains.map((chain) => chain.name).join(", ")}`
    ).start()
    const deployments = chains.map(async (chain) => {
        const kernelAccount = await createKernelAccountClient(privateKey, chain)
        const publicClient = createPublicClient({
            chain: chain.viemChainObject,
            transport: http(getZeroDevBundlerRPC(chain.projectId))
        })

        return deployToChain(
            kernelAccount,
            publicClient,
            bytecode,
            salt,
            expectedAddress
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
                spinner.start("Deployment is processing...")
                return result
            })
            .catch((error) => {
                if (error instanceof AlreadyDeployedError) {
                    spinner.warn(
                        `Contract already deployed at ${
                            error.address
                        } on ${chalk.yellowBright(chain.name)}`
                    )
                    spinner.start("Deployment is processing...")
                } else {
                    writeErrorLogToFile(chain.name, error)
                    spinner.fail(
                        `Deployment for ${chalk.redBright(
                            chain.name
                        )} failed! Check the error log at "./log" directory`
                    )
                    spinner.start("Deployment is processing...")
                }
            })
    })

    await Promise.allSettled(deployments)
    spinner.stop()
    console.log("✅ All deployments process successfully finished!")
}
