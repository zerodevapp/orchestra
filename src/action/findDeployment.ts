import type { Address, Hex, PublicClient } from "viem"
import { http, createPublicClient } from "viem"
import { getZeroDevBundlerRPC } from "../clients/index.js"
import { DEPLOYER_CONTRACT_ADDRESS, type ZerodevChain } from "../constant.js"
import { computeContractAddress } from "./computeAddress.js"
export enum DeploymentStatus {
    Deployed = 0,
    NotDeployed = 1,
    Error = 2
}

export const checkDeploymentOnChain = async (
    publicClient: PublicClient,
    contractAddress: Hex
): Promise<DeploymentStatus> => {
    const deployedBytecode = await publicClient.getBytecode({
        address: contractAddress
    })

    const nonce = await publicClient.getTransactionCount({
        address: contractAddress
    })

    return nonce > 0 || deployedBytecode
        ? DeploymentStatus.Deployed
        : DeploymentStatus.NotDeployed
}

export const findDeployment = async (
    bytecode: Hex,
    salt: Hex,
    chains: ZerodevChain[]
): Promise<{
    address: Address
    deployedChains: ZerodevChain[]
    notDeployedChains: ZerodevChain[]
    errorChains?: ZerodevChain[]
}> => {
    const address = computeContractAddress(
        DEPLOYER_CONTRACT_ADDRESS,
        bytecode,
        salt
    )

    const deploymentResults = await Promise.all(
        chains.map((chain) => {
            return checkDeploymentOnChain(
                createPublicClient({
                    chain: chain,
                    transport: http()
                }),
                address
            ).catch(() => DeploymentStatus.Error)
        })
    )

    const deployedChains = chains.filter(
        (_, index) => deploymentResults[index] === DeploymentStatus.Deployed
    )
    const notDeployedChains = chains.filter(
        (_, index) => deploymentResults[index] === DeploymentStatus.NotDeployed
    )
    const errorChains = chains.filter(
        (_, index) => deploymentResults[index] === DeploymentStatus.Error
    )

    return { address, deployedChains, notDeployedChains, errorChains }
}
