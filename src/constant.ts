import type { Chain } from "viem/chains"

/** @dev deterministic-deployment-proxy contract address */
export const DEPLOYER_CONTRACT_ADDRESS =
    "0x4e59b44847b379578588920ca78fbf26c0b4956c"

export type ZerodevChain = {
    onlySelfFunded: boolean
    rollupProvider: string | null
    deprecated: boolean
    explorerAPI: string | null
} & Chain

interface ZerodevChainResponse {
    chainId: number
    name: string
    nativeCurrencyName: string
    nativeCurrencySymbol: string
    nativeCurrencyDecimals: number
    rpcUrl: string
    explorerUrl: string
    testnet: boolean
    onlySelfFunded: boolean
    rollupProvider: string | null
    deprecated: boolean
}

interface ZerodevProjectResponse {
    id: string
    name: string
    teamId: string
    chains: {
        chain_id: number
        name: string
        testnet: boolean
    }[]
}

/*
curl --request GET \
     --url https://prod-api-us-east.onrender.com/v2/chains \
     --header `X-API-KEY: ${process.env.ZERODEV_API_KEY}` \
     --header 'accept: application/json'
  {
    "chainId": 1,
    "name": "Ethereum",
    "nativeCurrencyName": "Ether",
    "nativeCurrencySymbol": "ETH",
    "nativeCurrencyDecimals": 18,
    "rpcUrl": "https://eth.llamarpc.com",
    "explorerUrl": "https://etherscan.io",
    "testnet": false,
    "onlySelfFunded": false,
    "rollupProvider": null,
    "deprecated": false
  },
*/

export const getSupportedChains = async (): Promise<ZerodevChain[]> => {
    const response = await fetch(
        "https://prod-api-us-east.onrender.com/v2/chains",
        {
            headers: {
                "X-API-KEY": process.env.ZERODEV_API_KEY ?? "",
                accept: "application/json"
            }
        }
    )

    if (!response.ok) {
        throw new Error(`Failed to fetch chains: ${response.statusText}`)
    }

    const data = (await response.json()) as ZerodevChainResponse[]

    const chains_all = data.reduce(
        (acc, chain) => {
            const key = `${chain.name}-${chain.chainId}`
            acc[key] = {
                id: chain.chainId,
                name: chain.name,
                nativeCurrency: {
                    name: chain.nativeCurrencyName,
                    symbol: chain.nativeCurrencySymbol,
                    decimals: chain.nativeCurrencyDecimals
                },
                rpcUrls: {
                    default: { http: [chain.rpcUrl] }
                },
                onlySelfFunded: chain.onlySelfFunded,
                rollupProvider: chain.rollupProvider,
                deprecated: chain.deprecated,
                testnet: chain.testnet,
                explorerAPI: process.env[`${chain.name.toUpperCase()}_EXPLORER_API_KEY`] ?? process.env.ETHERSCAN_API_KEY ?? "" // try get chain specific api key, if not found, use etherscan api key
            }
            return acc
        },
        {} as Record<string, ZerodevChain>
    )

    const response_project = await fetch(
        `https://prod-api-us-east.onrender.com/v2/projects/${process.env.ZERODEV_PROJECT_ID}`,
        {
            headers: {
                "X-API-KEY": process.env.ZERODEV_API_KEY ?? "",
                accept: "application/json"
            }
        }
    )

    if (!response_project.ok) {
        throw new Error(
            `Failed to fetch project chains: ${response_project.statusText}`
        )
    }

    const chains_project =
        (await response_project.json()) as ZerodevProjectResponse

    const supportedChains = chains_project.chains
        .map((chain) => {
            const key = `${chain.name}-${chain.chain_id}`
            const matchedChain = chains_all[key]
            if (!matchedChain) {
                return null
            }
            return matchedChain
        })
        .filter((chain): chain is ZerodevChain => chain !== null)

    if (supportedChains.length === 0) {
        throw new Error("No supported chains found for the project")
    }

    return supportedChains
}
