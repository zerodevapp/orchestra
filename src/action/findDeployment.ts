import { http, Address, Hex, PublicClient, createPublicClient } from "viem"
import { getZeroDevBundlerRPC } from "../clients/index.js"
import { Chain, DEPLOYER_CONTRACT_ADDRESS } from "../constant.js"
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
    chains: Chain[]
): Promise<{
    address: Address
    deployedChains: Chain[]
    notDeployedChains: Chain[]
    errorChains?: Chain[]
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
                    transport: http(getZeroDevBundlerRPC(chain.projectId))
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
