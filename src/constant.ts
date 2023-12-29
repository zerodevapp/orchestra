import {
  arbitrum,
  arbitrumSepolia,
  avalanche,
  avalancheFuji,
  base,
  baseSepolia,
  bsc,
  mainnet,
  sepolia,
  optimism,
  optimismSepolia,
  polygon,
  polygonMumbai,
  linea,
  lineaTestnet,
  opBNB,
  astarZkatana,
} from 'viem/chains';

/** @dev deterministic-deployment-proxy contract address */
export const DEPLOYER_CONTRACT_ADDRESS =
  '0x4e59b44847b379578588920ca78fbf26c0b4956c';

export const ENTRYPOINT = '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789';

export type Network = 'mainnet' | 'testnet';

export interface Chain {
  name: string;
  rpcUrl: string | null;
  viemChainObject: any;
  type: Network;
}

export const SUPPORTED_CHAINS: Chain[] = [
  {
    name: 'arbitrum',
    rpcUrl: process.env.ARBITRUM_RPC_URL || null,
    viemChainObject: arbitrum,
    type: 'mainnet',
  },
  {
    name: 'arbitrum-sepolia',
    rpcUrl: process.env.ARBITRUM_SEPOLIA_RPC_URL || null,
    viemChainObject: arbitrumSepolia,
    type: 'testnet',
  },
  {
    name: 'avalanche',
    rpcUrl: process.env.AVALANCHE_RPC_URL || null,
    viemChainObject: avalanche,
    type: 'mainnet',
  },
  {
    name: 'avalanche-fuji',
    rpcUrl: process.env.AVALANCHE_FUJI_RPC_URL || null,
    viemChainObject: avalancheFuji,
    type: 'testnet',
  },
  {
    name: 'base',
    rpcUrl: process.env.BASE_RPC_URL || null,
    viemChainObject: base,
    type: 'mainnet',
  },
  {
    name: 'base-sepolia',
    rpcUrl: process.env.BASE_SEPOLIA_RPC_URL || null,
    viemChainObject: baseSepolia,
    type: 'testnet',
  },
  {
    name: 'bsc',
    rpcUrl: process.env.BSC_RPC_URL || null,
    viemChainObject: bsc,
    type: 'mainnet',
  },
  {
    name: 'mainnet',
    rpcUrl: process.env.MAINNET_RPC_URL || null,
    viemChainObject: mainnet,
    type: 'mainnet',
  },
  {
    name: 'sepolia',
    rpcUrl: process.env.SEPOILA_RPC_URL || null,
    viemChainObject: sepolia,
    type: 'testnet',
  },
  {
    name: 'optimism',
    rpcUrl: process.env.OPTIMISM_RPC_URL || null,
    viemChainObject: optimism,
    type: 'mainnet',
  },
  {
    name: 'optimism-sepolia',
    rpcUrl: process.env.OPTIMISM_SEPOLIA_RPC_URL || null,
    viemChainObject: optimismSepolia,
    type: 'testnet',
  },
  {
    name: 'polygon',
    rpcUrl: process.env.POLYGON_RPC_URL || null,
    viemChainObject: polygon,
    type: 'mainnet',
  },
  {
    name: 'polygon-mumbai',
    rpcUrl: process.env.POLYGON_MUMBAI_RPC_URL || null,
    viemChainObject: polygonMumbai,
    type: 'testnet',
  },
  {
    name: 'linea',
    rpcUrl: process.env.LINEA_RPC_URL || null,
    viemChainObject: linea,
    type: 'mainnet',
  },
  {
    name: 'linea-testnet',
    rpcUrl: process.env.LINEA_TESTNET_RPC_URL || null,
    viemChainObject: lineaTestnet,
    type: 'testnet',
  },
  {
    name: 'opbnb',
    rpcUrl: process.env.OPBNB_RPC_URL || null,
    viemChainObject: opBNB,
    type: 'mainnet',
  },
  {
    name: 'astarZkatana',
    rpcUrl: process.env.ASTAR_ZKATANA_RPC_URL || null,
    viemChainObject: astarZkatana,
    type: 'testnet',
  },
];
