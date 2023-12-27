import {
  arbitrum,
  arbitrumGoerli,
  avalanche,
  avalancheFuji,
  base,
  baseGoerli,
  bsc,
  mainnet,
  goerli,
  sepolia,
  optimism,
  optimismGoerli,
  polygon,
  polygonMumbai,
  linea,
  lineaTestnet,
  opBNB,
  astarZkatana,
} from 'viem/chains';

const BYTES_ZERO =
  '0x0000000000000000000000000000000000000000000000000000000000000000';

export const DEPLOYER_ABI = [
  {
    type: 'function',
    name: 'computeAddress',
    inputs: [
      { name: 'salt', type: 'bytes32', internalType: 'bytes32' },
      { name: 'bytecodeHash', type: 'bytes32', internalType: 'bytes32' },
    ],
    outputs: [{ name: 'addr', type: 'address', internalType: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'deploy',
    inputs: [
      { name: 'amount', type: 'uint256', internalType: 'uint256' },
      { name: 'salt', type: 'bytes32', internalType: 'bytes32' },
      { name: 'bytecode', type: 'bytes', internalType: 'bytes' },
    ],
    outputs: [{ name: 'addr', type: 'address', internalType: 'address' }],
    stateMutability: 'payable',
  },
  { type: 'error', name: 'Create2EmptyBytecode', inputs: [] },
  { type: 'error', name: 'Create2FailedDeployment', inputs: [] },
  {
    type: 'error',
    name: 'Create2InsufficientBalance',
    inputs: [
      { name: 'received', type: 'uint256', internalType: 'uint256' },
      {
        name: 'minimumNeeded',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
  },
];

export const COUNTER_CONTRACT_BYTECODE =
  '0x608060405234801561001057600080fd5b5060cc8061001f6000396000f3fe6080604052348015600f57600080fd5b506004361060325760003560e01c806306661abd146037578063d09de08a146051575b600080fd5b603f60005481565b60405190815260200160405180910390f35b60576059565b005b6001600080828254606991906070565b9091555050565b80820180821115609057634e487b7160e01b600052601160045260246000fd5b9291505056fea264697066735822122052dc90ec1ffdb0918b4141bc3d8a5937fb172b6689fdf50d0e0361d36415834a64736f6c63430008160033';

/** @dev deterministic-deployment-proxy contract address */
export const DEPLOYER_CONTRACT_ADDRESS =
  '0x4e59b44847b379578588920ca78fbf26c0b4956c';

export const ENTRYPOINT = '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789';

const VIEM_CHAINS = {
  arbitrum,
  arbitrumGoerli,
  avalanche,
  avalancheFuji,
  base,
  baseGoerli,
  bsc,
  mainnet,
  goerli,
  sepolia,
  optimism,
  optimismGoerli,
  polygon,
  polygonMumbai,
  linea,
  lineaTestnet,
  opBNB,
  astarZkatana,
};

export const getChainObject = (chainName: string) => {
  return VIEM_CHAINS[chainName as keyof typeof VIEM_CHAINS];
};

// TODO: manage mainnet and testnet together
// viem/chains string : pimlico chains string
export const SUPPORTED_CHAINS_MAP = {
  arbitrum: 'arbitrum',
  // arbitrumGoerli: 'arbitrum-goerli', // chain is not working now
  avalanche: 'avalanche',
  // avalancheFuji: 'avalanche-fuji', // does not support rpc url from viem, so exclude it for now
  base: 'base',
  // baseGoerli: 'base-goerli', // does not support from infura
  bsc: 'binance',
  mainnet: 'ethereum',
  goerli: 'goerli',
  sepolia: 'sepolia',
  optimism: 'optimism',
  optimismGoerli: 'optimism-goerli',
  polygon: 'polygon',
  polygonMumbai: 'mumbai',
  linea: 'linea',
  lineaTestnet: 'linea-testnet',
  opBNB: 'opbnb',
  // astarZkatana: 'astarZkatana', not supported yet
};

// TODO: add command for testnet only
// viem/chains string : pimlico chains string
export const TESTNET_CHAINS_MAP = {
  arbitrumGoerli: 'arbitrum-goerli',
  // avalancheFuji: 'avalanche-fuji', // does not support rpc url from viem, so exclude it for now
  // baseGoerli: 'base-goerli', // does not support from infura
  goerli: 'goerli',
  sepolia: 'sepolia',
  optimismGoerli: 'optimism-goerli',
  polygonMumbai: 'mumbai',
  lineaTestnet: 'linea-testnet',
};

export const PIMLICO_SUPPORTED_CHAINS = [
  'arbitrum-goerli',
  'arbitrum-sepolia',
  'arbitrum',
  'avalanche-fuji',
  'avalanche',
  'base-goerli',
  'base',
  'binance-testnet',
  'binance',
  'celo-alfajores-testnet',
  'celo',
  'chiado-testnet',
  'dfk-chain-test',
  'dfk-chain',
  'ethereum',
  'fuse',
  'gnosis',
  'goerli',
  'klaytn-baobab',
  'klaytn-cypress',
  'linea-testnet',
  'linea',
  'lyra',
  'mantle',
  'mumbai',
  'nautilus',
  'opbnb',
  'optimism-goerli',
  'optimism',
  'parallel-l3-testnet',
  'polygon',
  'scroll-alpha-testnet',
  'scroll-sepolia-testnet',
  'scroll',
  'sepolia',
  'xai-goerli-orbit',
];
