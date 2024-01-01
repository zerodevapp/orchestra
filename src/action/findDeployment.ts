import { Address, Hex, createPublicClient, http } from "viem"
import { Chain, DEPLOYER_CONTRACT_ADDRESS } from "../constant"
import { computeAddress } from "./computeAddress"
import { createZeroDevClient } from "../clients"

export enum DeploymentStatus {
    Deployed,
    NotDeployed
}

const checkDeploymentOnChain = async (
    chain: Chain,
    contractAddress: Hex
): Promise<DeploymentStatus> => {
    if (chain.projectId === null) {
        throw new Error(`PROJECT_ID for chain ${chain.name} is not specified`)
    }

    const publicClient = createPublicClient({
        chain: chain.viemChainObject,
        // zerodev bundler supports both public and bundler rpc
        transport: createZeroDevClient("bundler", chain.projectId)
    })
    const deployedBytecode = await publicClient.getBytecode({
        address: contractAddress
    })

    return deployedBytecode
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
}> => {
    const address = computeAddress(DEPLOYER_CONTRACT_ADDRESS, bytecode, salt)

    const deploymentResults = await Promise.all(
        chains.map((chain) => checkDeploymentOnChain(chain, address))
    )

    const deployedChains = chains.filter(
        (_, index) => deploymentResults[index] === DeploymentStatus.Deployed
    )
    const notDeployedChains = chains.filter(
        (_, index) => deploymentResults[index] === DeploymentStatus.NotDeployed
    )

    return { address, deployedChains, notDeployedChains }
}
