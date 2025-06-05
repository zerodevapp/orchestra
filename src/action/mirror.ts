import { DEPLOYER_CONTRACT_ADDRESS, getSupportedChains } from "../constant.js"
import { ensureHex } from "../utils/index.js"
import { validatePrivateKey } from "../utils/validate.js"
import { deployContracts } from "./deployContracts.js"

interface EtherscanContractCreationResponse {
    status: string
    message: string
    result: Array<{
        contractAddress: string
        contractCreator: string
        txHash: string
        blockNumber: string
        timestamp: string
        contractFactory: string
        creationBytecode: string
    }>
}

interface EtherscanTransactionResponse {
    jsonrpc: string
    id: number
    result: {
        blockHash: string
        blockNumber: string
        from: string
        gas: string
        gasPrice: string
        hash: string
        input: string
        nonce: string
        to: string
        transactionIndex: string
        value: string
        type: string
        v: string
        r: string
        s: string
    }
}

interface MirrorOptions {
    fromChain: string
    testnetAll?: boolean
    mainnetAll?: boolean
    allNetworks?: boolean
    chains?: string
}

export const mirrorContract = async (
    contractAddress: string,
    options: MirrorOptions
) => {
    const { fromChain, testnetAll, mainnetAll, allNetworks, chains } = options

    if (!fromChain) {
        throw new Error("Error: Source chain must be specified")
    }

    if (!contractAddress) {
        throw new Error("Error: Contract address must be specified")
    }

    const targetChains = await getSupportedChains()

    // Get the source chain object
    const sourceChain = targetChains.find(
        (chain) => chain.name.toLowerCase() === fromChain.toLowerCase()
    )

    if (!sourceChain) {
        throw new Error(`Error: Source chain ${fromChain} not found`)
    }

    // Fetch contract data from Etherscan
    const creationResponse = await fetch(
        `https://api.etherscan.io/v2/api?chainid=${sourceChain.id}&module=contract&action=getcontractcreation&contractaddresses=${contractAddress}&apikey=${sourceChain.explorerAPI}`
    )

    const creationData =
        (await creationResponse.json()) as EtherscanContractCreationResponse
    if (creationData.status !== "1" || !creationData.result?.[0]) {
        throw new Error("Error: Failed to fetch contract data from Etherscan")
    }

    const contractData = creationData.result[0]
    if (contractData.contractFactory !== DEPLOYER_CONTRACT_ADDRESS) {
        throw new Error(
            "Error: Contract was not deployed using the deterministic deployer"
        )
    }

    // Since we can't get the salt from the internal transaction directly,
    // we'll need to get it from the original transaction's input data
    const originalTxResponse = await fetch(
        `https://api.etherscan.io/v2/api?chainid=${sourceChain.id}&module=proxy&action=eth_getTransactionByHash&txhash=${contractData.txHash}&apikey=${sourceChain.explorerAPI}`
    )

    const originalTxData =
        (await originalTxResponse.json()) as EtherscanTransactionResponse
    if (!originalTxData.result?.input) {
        throw new Error("Error: Could not get the original transaction data")
    }

    // Extract salt from input data (first 32 bytes after the function selector)
    const saltHex = originalTxData.result.input.slice(2, 66) // Skip 0x and 4 bytes of function selector
    const salt = ensureHex(saltHex)

    // Filter target chains based on options
    let filteredChains = targetChains
    if (testnetAll) {
        filteredChains = targetChains.filter((chain) => chain.testnet)
    } else if (mainnetAll) {
        filteredChains = targetChains.filter((chain) => !chain.testnet)
    } else if (chains) {
        const chainNames = chains.split(",")
        filteredChains = targetChains.filter((chain) =>
            chainNames.some(
                (name: string) =>
                    chain.name.toLowerCase() === name.toLowerCase()
            )
        )
    }

    // Deploy the contract to target chains
    await deployContracts(
        validatePrivateKey(process.env.PRIVATE_KEY as `0x${string}`),
        ensureHex(contractData.creationBytecode),
        filteredChains,
        salt,
        contractAddress,
        undefined
    )
}
