import { program } from './command';
import { getDeployerAddress } from './action';

import {
  createSmartAccountClient,
  bundlerActions,
  createBundlerClient,
} from 'permissionless';
import { signerToEcdsaKernelSmartAccount } from 'permissionless/accounts';
import {
  createPimlicoPaymasterClient,
  createPimlicoBundlerClient,
} from 'permissionless/clients/pimlico';
import { UserOperation } from 'permissionless/types';
import {
  Address,
  createClient,
  createPublicClient,
  http,
  getContract,
  parseEther,
} from 'viem';
import { goerli, sepolia } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';
import { getUser } from './api';

// program.parse();
const CHAIN = 'sepolia';
const API_KEY = '384d73cb-17d2-4ac4-8bab-4b91e11e228c';

const COUNTER_BYTECODE =
  '0x608060405234801561001057600080fd5b5060cc8061001f6000396000f3fe6080604052348015600f57600080fd5b506004361060325760003560e01c806306661abd146037578063d09de08a146051575b600080fd5b603f60005481565b60405190815260200160405180910390f35b60576059565b005b6001600080828254606991906070565b9091555050565b80820180821115609057634e487b7160e01b600052601160045260246000fd5b9291505056fea264697066735822122052dc90ec1ffdb0918b4141bc3d8a5937fb172b6689fdf50d0e0361d36415834a64736f6c63430008160033';
const DEPLOYER_ADDRESS = '0x24d463B612BcdF78191E858F104Ff3e6fdf8Dc54';
// get json abi from ./abi/deployer-abi.json
const DEPLOYER_ABI = [
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

async function main() {
  const publicClient = createPublicClient({
    transport: http(
      'https://sepolia.infura.io/v3/83a8e692dd304374bc62330e2b24a0aa'
    ),
  });
  const paymasterClient = createPimlicoPaymasterClient({
    transport: http(`https://api.pimlico.io/v2/${CHAIN}/rpc?apikey=${API_KEY}`),
  });
  const signer = privateKeyToAccount(
    '0x468f0c80d5336c4a45be71fa19b77e9320dc0abaea4fd018e0c49aca90c1db78'
  );
  const kernelAccount = await signerToEcdsaKernelSmartAccount(publicClient, {
    entryPoint: '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789', // global entrypoint
    signer: signer,
    index: 0n, // optional
  });
  const smartAccountClient = createSmartAccountClient({
    account: kernelAccount,
    chain: sepolia,
    transport: http(`https://api.pimlico.io/v1/${CHAIN}/rpc?apikey=${API_KEY}`),
    sponsorUserOperation: paymasterClient.sponsorUserOperation, // optional
  });
  const bundlerClient = createPimlicoBundlerClient({
    transport: http(`https://api.pimlico.io/v1/${CHAIN}/rpc?apikey=${API_KEY}`),
  });
  const gasPrices = await bundlerClient.getUserOperationGasPrice();
  if (
    gasPrices.fast.maxFeePerGas === undefined ||
    gasPrices.fast.maxPriorityFeePerGas === undefined
  ) {
    throw new Error('gas prices not available');
  }
  /** send simple transaction */
  // const txHash = await smartAccountClient.sendTransaction({
  //   to: '0xd8da6bf26964af9d7eed9e03e53415d37aa96045',
  //   value: parseEther('0.1'),
  //   maxFeePerGas: gasPrices.fast.maxFeePerGas, // if using Pimlico
  //   maxPriorityFeePerGas: gasPrices.fast.maxPriorityFeePerGas, // if using Pimlico
  // });
  // console.log(txHash);
  /** send contract interaction */
  const deployerContract = getContract({
    address: DEPLOYER_ADDRESS,
    abi: DEPLOYER_ABI,
    publicClient,
    walletClient: smartAccountClient,
  });
  const txHash = await deployerContract.write.deploy([
    parseEther('0'), // 32 bytes salt with all 0
    '0x' + '00'.repeat(32),
    COUNTER_BYTECODE,
  ]);
  console.log(txHash);
}

if (require.main === module) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
