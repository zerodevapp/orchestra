import {
    Chain as ViemChain,
    arbitrum,
    arbitrumSepolia,
    astarZkatana,
    avalanche,
    avalancheFuji,
    base,
    baseSepolia,
    bsc,
    linea,
    lineaTestnet,
    mainnet,
    opBNB,
    optimism,
    optimismSepolia,
    polygon,
    polygonMumbai,
    sepolia
} from "viem/chains"

/** @dev deterministic-deployment-proxy contract address */
export const DEPLOYER_CONTRACT_ADDRESS =
    "0x4e59b44847b379578588920ca78fbf26c0b4956c"

export const ENTRYPOINT = "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789"

export enum Network {
    mainnet = "mainnet",
    testnet = "testnet"
}

export interface UnvalidatedChain {
    name: string
    projectId: string | null
    etherscanApiKey?: string
    viemChainObject: ViemChain
    type: Network
}

export interface Chain {
    name: string
    projectId: string
    etherscanApiKey?: string
    viemChainObject: ViemChain
    type: Network
}

export const getSupportedChains = (): UnvalidatedChain[] => [
    {
        name: "arbitrum",
        projectId: process.env.ARBITRUM_PROJECT_ID || null,
        etherscanApiKey: process.env.ARBITRUM_ETHERSCAN_API_KEY || undefined,
        viemChainObject: arbitrum,
        type: Network.mainnet
    },
    {
        name: "arbitrum-sepolia",
        projectId: process.env.ARBITRUM_SEPOLIA_PROJECT_ID || null,
        etherscanApiKey:
            process.env.ARBITRUM_SEPOLIA_ETHERSCAN_API_KEY || undefined,
        viemChainObject: arbitrumSepolia,
        type: Network.testnet
    },
    {
        name: "avalanche",
        projectId: process.env.AVALANCHE_PROJECT_ID || null,
        etherscanApiKey: process.env.AVALANCHE_ETHERSCAN_API_KEY || undefined,
        viemChainObject: avalanche,
        type: Network.mainnet
    },
    {
        name: "avalanche-fuji",
        projectId: process.env.AVALANCHE_FUJI_PROJECT_ID || null,
        etherscanApiKey:
            process.env.AVALANCHE_FUJI_ETHERSCAN_API_KEY || undefined,
        viemChainObject: avalancheFuji,
        type: Network.testnet
    },
    {
        name: "base",
        projectId: process.env.BASE_PROJECT_ID || null,
        etherscanApiKey: process.env.BASE_ETHERSCAN_API_KEY || undefined,
        viemChainObject: base,
        type: Network.mainnet
    },
    {
        name: "base-sepolia",
        projectId: process.env.BASE_SEPOLIA_PROJECT_ID || null,
        etherscanApiKey:
            process.env.BASE_SEPOLIA_ETHERSCAN_API_KEY || undefined,
        viemChainObject: baseSepolia,
        type: Network.testnet
    },
    {
        name: "bsc",
        projectId: process.env.BSC_PROJECT_ID || null,
        etherscanApiKey: process.env.BSC_ETHERSCAN_API_KEY || undefined,
        viemChainObject: bsc,
        type: Network.mainnet
    },
    {
        name: Network.mainnet,
        projectId: process.env.MAINNET_PROJECT_ID || null,
        etherscanApiKey: process.env.MAINNET_ETHERSCAN_API_KEY || undefined,
        viemChainObject: mainnet,
        type: Network.mainnet
    },
    {
        name: "sepolia",
        projectId: process.env.SEPOILA_PROJECT_ID || null,
        etherscanApiKey: process.env.SEPOILA_ETHERSCAN_API_KEY || undefined,
        viemChainObject: sepolia,
        type: Network.testnet
    },
    {
        name: "optimism",
        projectId: process.env.OPTIMISM_PROJECT_ID || null,
        etherscanApiKey: process.env.OPTIMISM_ETHERSCAN_API_KEY || undefined,
        viemChainObject: optimism,
        type: Network.mainnet
    },
    {
        name: "optimism-sepolia",
        projectId: process.env.OPTIMISM_SEPOLIA_PROJECT_ID || null,
        etherscanApiKey:
            process.env.OPTIMISM_SEPOLIA_ETHERSCAN_API_KEY || undefined,
        viemChainObject: optimismSepolia,
        type: Network.testnet
    },
    {
        name: "polygon",
        projectId: process.env.POLYGON_PROJECT_ID || null,
        etherscanApiKey: process.env.POLYGON_ETHERSCAN_API_KEY || undefined,
        viemChainObject: polygon,
        type: Network.mainnet
    },
    {
        name: "polygon-mumbai",
        projectId: process.env.POLYGON_MUMBAI_PROJECT_ID || null,
        etherscanApiKey:
            process.env.POLYGON_MUMBAI_ETHERSCAN_API_KEY || undefined,
        viemChainObject: polygonMumbai,
        type: Network.testnet
    },
    {
        name: "linea",
        projectId: process.env.LINEA_PROJECT_ID || null,
        etherscanApiKey: process.env.LINEA_ETHERSCAN_API_KEY || undefined,
        viemChainObject: linea,
        type: Network.mainnet
    },
    {
        name: "linea-testnet",
        projectId: process.env.LINEA_TESTNET_PROJECT_ID || null,
        etherscanApiKey:
            process.env.LINEA_TESTNET_ETHERSCAN_API_KEY || undefined,
        viemChainObject: lineaTestnet,
        type: Network.testnet
    },
    {
        name: "opbnb",
        projectId: process.env.OPBNB_PROJECT_ID || null,
        etherscanApiKey: process.env.OPBNB_ETHERSCAN_API_KEY || undefined,
        viemChainObject: opBNB,
        type: Network.mainnet
    },
    {
        name: "astar-zkatana",
        projectId: process.env.ASTAR_ZKATANA_PROJECT_ID || null,
        etherscanApiKey:
            process.env.ASTAR_ZKATANA_ETHERSCAN_API_KEY || undefined,
        viemChainObject: astarZkatana,
        type: Network.testnet
    }
]
