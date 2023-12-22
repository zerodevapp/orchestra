import { goerli, mainnet, sepolia } from 'viem/chains';

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

export const COUNTER_BYTECODE =
  '0x608060405234801561001057600080fd5b5060cc8061001f6000396000f3fe6080604052348015600f57600080fd5b506004361060325760003560e01c806306661abd146037578063d09de08a146051575b600080fd5b603f60005481565b60405190815260200160405180910390f35b60576059565b005b6001600080828254606991906070565b9091555050565b80820180821115609057634e487b7160e01b600052601160045260246000fd5b9291505056fea264697066735822122052dc90ec1ffdb0918b4141bc3d8a5937fb172b6689fdf50d0e0361d36415834a64736f6c63430008160033';

export const DEPLOYER_ADDRESS = '0x24d463B612BcdF78191E858F104Ff3e6fdf8Dc54';

export const ENTRYPOINT = '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789';

export const CHAIN_MAP = {
  mainnet,
  sepolia,
  goerli,
  // TODO: add more
};
