import {
    type Chain as ViemChain,
    arbitrum,
    arbitrumNova,
    arbitrumSepolia,
    astarZkEVM,
    astarZkyoto,
    avalanche,
    avalancheFuji,
    base,
    baseSepolia,
    blast,
    blastSepolia,
    bsc,
    celo,
    celoAlfajores,
    cyber,
    cyberTestnet,
    degen,
    linea,
    lineaTestnet,
    mainnet,
    opBNB,
    optimism,
    optimismSepolia,
    polygon,
    polygonAmoy,
    sepolia
} from "viem/chains"

/** @dev deterministic-deployment-proxy contract address */
export const DEPLOYER_CONTRACT_ADDRESS =
    "0x4e59b44847b379578588920ca78fbf26c0b4956c"

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
        name: "arbitrum-nova",
        projectId: process.env.ARBITRUM_NOVA_PROJECT_ID || null,
        etherscanApiKey:
            process.env.ARBITRUM_NOVA_ETHERSCAN_API_KEY || undefined,
        viemChainObject: arbitrumNova,
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
        name: "astar-zkEVM",
        projectId: process.env.ASTAR_ZKEVM_PROJECT_ID || null,
        etherscanApiKey: process.env.ASTAR_ZKEVM_ETHERSCAN_API_KEY || undefined,
        viemChainObject: astarZkEVM,
        type: Network.mainnet
    },
    {
        name: "astar-zkyoto",
        projectId: process.env.ASTAR_ZKYOTO_PROJECT_ID || null,
        etherscanApiKey:
            process.env.ASTAR_ZKYOTO_ETHERSCAN_API_KEY || undefined,
        viemChainObject: astarZkyoto,
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
        name: "blast",
        projectId: process.env.BLAST_PROJECT_ID || null,
        etherscanApiKey: process.env.BLAST_ETHERSCAN_API_KEY || undefined,
        viemChainObject: blast,
        type: Network.mainnet
    },
    {
        name: "blast-sepolia",
        projectId: process.env.BLAST_SEPOLIA_PROJECT_ID || null,
        etherscanApiKey: process.env.BLAST_ETHERSCAN_API_KEY || undefined,
        viemChainObject: blastSepolia,
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
        name: "celo",
        projectId: process.env.CELO_PROJECT_ID || null,
        etherscanApiKey: process.env.CELO_ETHERSCAN_API_KEY || undefined,
        viemChainObject: celo,
        type: Network.mainnet
    },
    {
        name: "celo-alfajores",
        projectId: process.env.CELO_ALFAJORES_PROJECT_ID || null,
        etherscanApiKey:
            process.env.CELO_ALFAJORES_ETHERSCAN_API_KEY || undefined,
        viemChainObject: celoAlfajores,
        type: Network.testnet
    },
    {
        name: "cyber",
        projectId: process.env.CYBER_PROJECT_ID || null,
        etherscanApiKey: process.env.CYBER_ETHERSCAN_API_KEY || undefined,
        viemChainObject: cyber,
        type: Network.mainnet
    },
    {
        name: "cyber-testnet",
        projectId: process.env.CYBER_TESTNET_PROJECT_ID || null,
        etherscanApiKey:
            process.env.CYBER_TESTNET_ETHERSCAN_API_KEY || undefined,
        viemChainObject: cyberTestnet,
        type: Network.testnet
    },
    {
        name: "degen",
        projectId: process.env.DEGEN_PROJECT_ID || null,
        etherscanApiKey: process.env.DEGEN_ETHERSCAN_API_KEY || undefined,
        viemChainObject: degen,
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
        name: "opbnb",
        projectId: process.env.OPBNB_PROJECT_ID || null,
        etherscanApiKey: process.env.OPBNB_ETHERSCAN_API_KEY || undefined,
        viemChainObject: opBNB,
        type: Network.mainnet
    },
    {
        name: "polygon",
        projectId: process.env.POLYGON_PROJECT_ID || null,
        etherscanApiKey: process.env.POLYGON_ETHERSCAN_API_KEY || undefined,
        viemChainObject: polygon,
        type: Network.mainnet
    },
    {
        name: "polygon-amoy",
        projectId: process.env.POLYGON_AMOY_PROJECT_ID || null,
        etherscanApiKey:
            process.env.POLYGON_AMOY_ETHERSCAN_API_KEY || undefined,
        viemChainObject: polygonAmoy,
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
    }
]
