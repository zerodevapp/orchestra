import { Address, Hex, createPublicClient } from "viem"
import { createZeroDevClient } from "../clients"
import { Chain, DEPLOYER_CONTRACT_ADDRESS } from "../constant"
import { computeContractAddress } from "./computeAddress"

export enum DeploymentStatus {
    Deployed = 0,
    NotDeployed = 1,
    Error
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
    console.log(deployedBytecode)

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
    errorChains?: Chain[]
}> => {
    const address = computeContractAddress(
        DEPLOYER_CONTRACT_ADDRESS,
        bytecode,
        salt
    )

    const deploymentResults = await Promise.all(
        chains.map((chain) =>
            checkDeploymentOnChain(chain, address).catch(
                () => DeploymentStatus.Error
            )
        )
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
