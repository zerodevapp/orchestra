import chalk from 'chalk';
import {
  Hex,
  createPublicClient,
  encodeFunctionData,
  http,
  parseAbi,
  parseEther,
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { createSmartAccountClient } from 'permissionless';
import { signerToEcdsaKernelSmartAccount } from 'permissionless/accounts';
import {
  createPimlicoPaymasterClient,
  createPimlicoBundlerClient,
} from 'permissionless/clients/pimlico';
import { SessionKeyProvider } from '@zerodev/sdk';
import {
  DEPLOYER_ABI,
  DEPLOYER_CONTRACT_ADDRESS,
  ENTRYPOINT,
  SUPPORTED_CHAINS_MAP,
  getChainObject,
} from '../constant';
import {
  PIMLICO_API_KEY,
  PRIVATE_KEY,
  RPC_PROVIDER_API_KEY,
  ZERODEV_PROJECT_ID,
} from '../config';
import { ensureHex } from '../utils';

const contractABI = parseAbi([
  'function deploy(uint256 amount, bytes32 salt, bytes memory bytecode) external payable returns (address addr)',
  'function computeAddress(bytes32 salt, bytes32 bytecodeHash) external view returns (address addr)',
]);

const PIMLICO_BASE_URL = 'api.pimlico.io';

const buildUrlForInfura = (baseUrl: string) =>
  `${baseUrl}/${RPC_PROVIDER_API_KEY}`;

const buildUrlForPimlico = (chain: string, version: string) =>
  `https://${PIMLICO_BASE_URL}/${version}/${chain}/rpc?apikey=${PIMLICO_API_KEY}`;

const createPimlicoClient = (chain: string, version: string) =>
  http(buildUrlForPimlico(chain, version));

const deployToChain = async (
  chain: string,
  bytecode: Hex,
  salt: Hex,
  expectedAddress: string | undefined,
  serializedSessionKeyParams: string | undefined
) => {
  const viemChainObject = getChainObject(chain);
  const infuraChainUrl =
    'infura' in viemChainObject.rpcUrls ? viemChainObject.rpcUrls.infura : null;

  if (!infuraChainUrl) {
    throw new Error(`Infura RPC URL not found for chain: ${chain}`);
  }
  const pimlicoChainKey =
    SUPPORTED_CHAINS_MAP[chain as keyof typeof SUPPORTED_CHAINS_MAP];

  const publicClient = createPublicClient({
    transport: http(buildUrlForInfura(infuraChainUrl.http[0])),
  });

  const paymasterClient = createPimlicoPaymasterClient({
    transport: createPimlicoClient(pimlicoChainKey, 'v2'),
  });

  const signer = privateKeyToAccount(ensureHex(PRIVATE_KEY));

  const kernelAccount = await signerToEcdsaKernelSmartAccount(publicClient, {
    entryPoint: ENTRYPOINT,
    signer: signer,
    index: 0n,
  });

  const smartAccountClient = createSmartAccountClient({
    account: kernelAccount,
    chain: viemChainObject,
    transport: createPimlicoClient(pimlicoChainKey, 'v1'),
    sponsorUserOperation: paymasterClient.sponsorUserOperation,
  });

  const sessionKeyProvider = serializedSessionKeyParams
    ? await SessionKeyProvider.fromSessionKeyParams({
        projectId: ZERODEV_PROJECT_ID,
        sessionKeyParams: SessionKeyProvider.deserializeSessionKeyParams(
          serializedSessionKeyParams
        ),
      })
    : undefined;

  const bundlerClient = createPimlicoBundlerClient({
    transport: createPimlicoClient(pimlicoChainKey, 'v1'),
  });

  const gasPrices = await bundlerClient.getUserOperationGasPrice();
  if (
    gasPrices.fast.maxFeePerGas === undefined ||
    gasPrices.fast.maxPriorityFeePerGas === undefined
  ) {
    throw new Error('gas prices not available');
  }

  const { request, result } = await publicClient.simulateContract({
    address: DEPLOYER_CONTRACT_ADDRESS,
    abi: DEPLOYER_ABI,
    functionName: 'deploy',
    args: [parseEther('0'), salt, bytecode],
    account: kernelAccount.address,
  });

  const txHash = sessionKeyProvider
    ? (
        await sessionKeyProvider.sendUserOperation({
          target: DEPLOYER_CONTRACT_ADDRESS,
          data: encodeFunctionData({
            abi: contractABI,
            functionName: 'deploy',
            args: [parseEther('0'), salt, bytecode],
          }),
        })
      ).hash
    : await smartAccountClient.writeContract(request);

  if (expectedAddress && result !== expectedAddress) {
    console.warn(
      `Contract deployed at ${result} on ${chain} with transaction hash ${txHash} does not match expected address ${expectedAddress}`
    );
  }

  console.log(
    `Contract deployed at ${result} on ${chain} with transaction hash ${txHash}`
  );
};

export const deployContracts = async (
  bytecode: Hex,
  chains: string[],
  salt: Hex,
  expectedAddress: string | undefined,
  serializedSessionKeyParams: string | undefined
) => {
  const deploymentStatus: Record<string, string> = {};
  chains.forEach((chain) => {
    deploymentStatus[chain] = 'starting...';
  });

  const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
  let frameIndex = 0;

  const updateConsole = () => {
    console.clear();
    console.log('Starting deployments...');
    chains.forEach((chain) => {
      const frame =
        deploymentStatus[chain] === 'starting...'
          ? chalk.green(frames[frameIndex])
          : '';
      console.log(
        `${frame} Deployment for ${chain} is ${deploymentStatus[chain]}`
      );
    });
    frameIndex = (frameIndex + 1) % frames.length;
  };

  const interval = setInterval(updateConsole, 100);

  const deployments = chains.map((chain) =>
    deployToChain(
      chain,
      bytecode,
      salt,
      expectedAddress,
      serializedSessionKeyParams
    )
      .then((txHash) => {
        deploymentStatus[chain] = 'done!';
      })
      .catch((error) => {
        deploymentStatus[chain] = `failed: ${error}`;
      })
  );

  await Promise.all(deployments);
  clearInterval(interval);
  frameIndex = 0; // Reset for a clean final display
  updateConsole(); // Final update
  console.log('All deployments complete!');
};