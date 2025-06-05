import type { Command } from "commander"
import { deployContracts } from "../action/index.js"
import { PRIVATE_KEY } from "../config.js"
import { DEPLOYER_CONTRACT_ADDRESS, getSupportedChains } from "../constant.js"
import { ensureHex, processAndValidateChains } from "../utils/index.js"
import { validatePrivateKey } from "../utils/validate.js"
import { chainSelectionOptions, mirrorOption } from "./options.js"

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

export const mirrorCommand = (program: Command) => {
    program
        .command("mirror")
        .description("Mirror a contract from one chain to other chains")
        .addOptions([mirrorOption, ...chainSelectionOptions])
        .argument("<contract-address>", "contract address to mirror")
        .action(async (contractAddress, options) => {
            const { fromChain, testnetAll, mainnetAll, allNetworks, chains } =
                options

            if (!fromChain) {
                console.error("Error: Source chain must be specified")
                process.exit(1)
            }

            if (!contractAddress) {
                console.error("Error: Contract address must be specified")
                process.exit(1)
            }

            const targetChains = await processAndValidateChains({
                testnetAll,
                mainnetAll,
                allNetworks,
                chainOption: chains
            })

            // Get the source chain object
            const sourceChain = (await getSupportedChains()).find(
                (chain) => chain.name.toLowerCase() === fromChain.toLowerCase()
            )

            if (!sourceChain) {
                console.error(`Error: Source chain ${fromChain} not found`)
                process.exit(1)
            }

            // Fetch contract data from Etherscan
            const creationResponse = await fetch(
                `https://api.etherscan.io/v2/api?chainid=${sourceChain.id}&module=contract&action=getcontractcreation&contractaddresses=${contractAddress}&apikey=${sourceChain.explorerAPI}`
            )

            const creationData =
                (await creationResponse.json()) as EtherscanContractCreationResponse
            if (creationData.status !== "1" || !creationData.result?.[0]) {
                console.error(
                    "Error: Failed to fetch contract data from Etherscan"
                )
                process.exit(1)
            }

            const contractData = creationData.result[0]
            if (contractData.contractFactory !== DEPLOYER_CONTRACT_ADDRESS) {
                console.error(
                    "Error: Contract was not deployed using the deterministic deployer"
                )
                process.exit(1)
            }

            // Since we can't get the salt from the internal transaction directly,
            // we'll need to get it from the original transaction's input data
            const originalTxResponse = await fetch(
                `https://api.etherscan.io/v2/api?chainid=${sourceChain.id}&module=proxy&action=eth_getTransactionByHash&txhash=${contractData.txHash}&apikey=${sourceChain.explorerAPI}`
            )

            const originalTxData =
                (await originalTxResponse.json()) as EtherscanTransactionResponse
            if (!originalTxData.result?.input) {
                console.error(
                    "Error: Could not get the original transaction data"
                )
                process.exit(1)
            }

            // Extract salt from input data (first 32 bytes after the function selector)
            const salt = `0x${originalTxData.result.input.slice(2, 66)}` // Skip 0x and 4 bytes of function selector

            // Deploy the contract to target chains
            await deployContracts(
                validatePrivateKey(PRIVATE_KEY),
                ensureHex(contractData.creationBytecode),
                targetChains,
                ensureHex(salt),
                contractAddress,
                undefined
            )

            console.log("✅ Contracts mirrored successfully!")
        })
}
