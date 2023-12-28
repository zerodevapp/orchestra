import chalk from 'chalk';
import {
  Hex,
  createPublicClient,
  http,
} from 'viem';

import { privateKeyToAccount } from 'viem/accounts';
import { createSmartAccountClient } from 'permissionless';
import { signerToEcdsaKernelSmartAccount } from 'permissionless/accounts';
import { SessionKeyProvider } from '@zerodev/sdk';

import { createZeroDevBundlerClient, createZeroDevPaymasterClient } from "../clients/ZeroDevClient"
import {
  DEPLOYER_CONTRACT_ADDRESS,
  ENTRYPOINT,
  getChainObject,
} from '../constant';
import {
  PRIVATE_KEY,
  RPC_PROVIDER_API_KEY,
  ZERODEV_PROJECT_ID,
} from '../config';
import { ensureHex } from '../utils';

const buildUrlForInfura = (baseUrl: string) =>
  `${baseUrl}/${RPC_PROVIDER_API_KEY}`;

const ZERODEV_URL = 'https://meta-aa-provider.onrender.com/api/v2';

const createZeroDevClient = (mode: string,projectId: string) =>
  http(`${ZERODEV_URL}/${mode}/${projectId}`);

const deployToChain = async (
  chain: string,
  bytecode: Hex,
  salt: Hex,
  expectedAddress: string | undefined,
  serializedSessionKeyParams: string | undefined
): Promise<[string, string]> => {
  const viemChainObject = getChainObject(chain);
  console.log(viemChainObject)
  const infuraChainUrl =
    'infura' in viemChainObject.rpcUrls ? viemChainObject.rpcUrls.infura : null;

  if (!infuraChainUrl) {
    throw new Error(`Infura RPC URL not found for chain: ${chain}`);
  }

  const publicClient = createPublicClient({
    transport: http(buildUrlForInfura(infuraChainUrl.http[0])),
  });

  const gasPrices = await publicClient.estimateFeesPerGas();

  const paymasterClient = createZeroDevPaymasterClient({
    chain: viemChainObject,
    transport: createZeroDevClient('paymaster', ZERODEV_PROJECT_ID),
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
    transport: createZeroDevClient('bundler', ZERODEV_PROJECT_ID),
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

  const result = await publicClient.call({
    account: kernelAccount.address,
    data: ensureHex(salt + bytecode.slice(2)),
    to: DEPLOYER_CONTRACT_ADDRESS,
  });

  if (expectedAddress && result.data !== expectedAddress) {
    throw new Error(
      `Contract will be deployed at ${result.data} on ${chain} does not match expected address ${expectedAddress}`
    );
  }

  const txHash = sessionKeyProvider
    ? (
        await sessionKeyProvider.sendUserOperation({
          target: DEPLOYER_CONTRACT_ADDRESS,
          data: ensureHex(salt + bytecode.slice(2)),
        })
      ).hash
    : await smartAccountClient.sendTransaction({
        to: DEPLOYER_CONTRACT_ADDRESS,
        data: ensureHex(salt + bytecode.slice(2)),
        maxFeePerGas: gasPrices.maxFeePerGas,
        maxPriorityFeePerGas: gasPrices.maxPriorityFeePerGas,
      });

  return [result.data as string, txHash];
};

export const deployContracts = async (
  bytecode: Hex,
  chains: string[],
  salt: Hex,
  expectedAddress: string | undefined,
  serializedSessionKeyParams: string | undefined
) => {
  const deploymentStatus: Record<
    string,
    { status: string; result?: string; txHash?: string }
  > = {};
  chains.forEach((chain) => {
    deploymentStatus[chain] = { status: 'starting...' };
  });

  const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
  let frameIndex = 0;

  const updateConsole = () => {
    console.clear();
    console.log('Starting deployments...');
    chains.forEach((chain) => {
      const frame =
        deploymentStatus[chain].status === 'starting...'
          ? chalk.green(frames[frameIndex])
          : '';
      if (deploymentStatus[chain].status === 'done!') {
        console.log(
          `Contract deployed at ${deploymentStatus[chain].result} on ${chain} with transaction hash ${deploymentStatus[chain].txHash}`
        );
      } else {
        console.log(
          `${frame} Deployment for ${chain} is ${deploymentStatus[chain].status}`
        );
      }
    });
    frameIndex = (frameIndex + 1) % frames.length;
  };

  const interval = setInterval(updateConsole, 100);

  // TODO: describe status of each deployment regardless of error, user should be able to see which deployment succeeded and which failed
  const deployments = chains.map((chain) =>
    deployToChain(
      chain,
      bytecode,
      salt,
      expectedAddress,
      serializedSessionKeyParams
    )
      .then(([result, txHash]) => {
        deploymentStatus[chain] = { status: 'done!', result, txHash };
      })
      .catch((error) => {
        deploymentStatus[chain] = { status: `failed: ${error}` };
        // TODO: throw error gracefully, or save the log to a file
        throw error;
      })
  );

  await Promise.all(deployments);

  clearInterval(interval);
  frameIndex = 0; // Reset for a clean final display
  updateConsole(); // Final update
  console.log('All deployments process successfully finished!');
};
