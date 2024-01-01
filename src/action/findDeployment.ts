import { Hex, createPublicClient, http } from "viem"
import { Chain, DEPLOYER_CONTRACT_ADDRESS } from "../constant"
import { computeAddress } from "./computeAddress"
import { createZeroDevClient } from "../clients"

const checkDeploymentOnChain = async (chain: Chain, contractAddress: Hex) => {
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

    return deployedBytecode ? "deployed" : "notDeployed"
}

export const findDeployment = async (
    bytecode: Hex,
    salt: Hex,
    chains: Chain[]
) => {
    const contractAddress = computeAddress(
        DEPLOYER_CONTRACT_ADDRESS,
        bytecode,
        salt
    )

    const deploymentResults = await Promise.all(
        chains.map((chain) => checkDeploymentOnChain(chain, contractAddress))
    )

    const deployedChains = chains.filter(
        (_, index) => deploymentResults[index] === "deployed"
    )
    const notDeployedChains = chains.filter(
        (_, index) => deploymentResults[index] === "notDeployed"
    )

    return { contractAddress, deployedChains, notDeployedChains }
}
