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
  projectId: string | null;
  viemChainObject: any;
  type: Network;
}

export const getSupportedChains = (): Chain[] => [
  {
    name: 'arbitrum',
    projectId: process.env.ARBITRUM_PROJECT_ID || null,
    viemChainObject: arbitrum,
    type: 'mainnet',
  },
  {
    name: 'arbitrum-sepolia',
    projectId: process.env.ARBITRUM_SEPOLIA_PROJECT_ID || null,
    viemChainObject: arbitrumSepolia,
    type: 'testnet',
  },
  {
    name: 'avalanche',
    projectId: process.env.AVALANCHE_PROJECT_ID || null,
    viemChainObject: avalanche,
    type: 'mainnet',
  },
  {
    name: 'avalanche-fuji',
    projectId: process.env.AVALANCHE_FUJI_PROJECT_ID || null,
    viemChainObject: avalancheFuji,
    type: 'testnet',
  },
  {
    name: 'base',
    projectId: process.env.BASE_PROJECT_ID || null,
    viemChainObject: base,
    type: 'mainnet',
  },
  {
    name: 'base-sepolia',
    projectId: process.env.BASE_SEPOLIA_PROJECT_ID || null,
    viemChainObject: baseSepolia,
    type: 'testnet',
  },
  {
    name: 'bsc',
    projectId: process.env.BSC_PROJECT_ID || null,
    viemChainObject: bsc,
    type: 'mainnet',
  },
  {
    name: 'mainnet',
    projectId: process.env.MAINNET_PROJECT_ID || null,
    viemChainObject: mainnet,
    type: 'mainnet',
  },
  {
    name: 'sepolia',
    projectId: process.env.SEPOILA_PROJECT_ID || null,
    viemChainObject: sepolia,
    type: 'testnet',
  },
  {
    name: 'optimism',
    projectId: process.env.OPTIMISM_PROJECT_ID || null,
    viemChainObject: optimism,
    type: 'mainnet',
  },
  {
    name: 'optimism-sepolia',
    projectId: process.env.OPTIMISM_SEPOLIA_PROJECT_ID || null,
    viemChainObject: optimismSepolia,
    type: 'testnet',
  },
  {
    name: 'polygon',
    projectId: process.env.POLYGON_PROJECT_ID || null,
    viemChainObject: polygon,
    type: 'mainnet',
  },
  {
    name: 'polygon-mumbai',
    projectId: process.env.POLYGON_MUMBAI_PROJECT_ID || null,
    viemChainObject: polygonMumbai,
    type: 'testnet',
  },
  {
    name: 'linea',
    projectId: process.env.LINEA_PROJECT_ID || null,
    viemChainObject: linea,
    type: 'mainnet',
  },
  {
    name: 'linea-testnet',
    projectId: process.env.LINEA_TESTNET_PROJECT_ID || null,
    viemChainObject: lineaTestnet,
    type: 'testnet',
  },
  {
    name: 'opbnb',
    projectId: process.env.OPBNB_PROJECT_ID || null,
    viemChainObject: opBNB,
    type: 'mainnet',
  },
  {
    name: 'astar-zkatana',
    projectId: process.env.ASTAR_ZKATANA_PROJECT_ID || null,
    viemChainObject: astarZkatana,
    type: 'testnet',
  },
];
