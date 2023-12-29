import chalk from 'chalk';
import { Hex, createPublicClient, getAddress, http } from 'viem';

import { privateKeyToAccount } from 'viem/accounts';
import { createSmartAccountClient } from 'permissionless';
import { signerToEcdsaKernelSmartAccount } from 'permissionless/accounts';
import { SessionKeyProvider } from '@zerodev/sdk';
import { createZeroDevPaymasterClient } from '../clients/ZeroDevClient';
import { Chain, DEPLOYER_CONTRACT_ADDRESS, ENTRYPOINT } from '../constant';
import { PRIVATE_KEY } from '../config';
import { ensureHex } from '../utils';
import { createZeroDevClient } from '../clients';

const deployToChain = async (
  chain: Chain,
  bytecode: Hex,
  salt: Hex,
  expectedAddress: string | undefined
): Promise<[string, string]> => {
  if (chain.projectId === null) {
    throw new Error(`PROJECT_ID for chain ${chain.name} is not specified`);
  }

  const publicClient = createPublicClient({
    chain: chain.viemChainObject,
    // zerodev bundler supports both public and bundler rpc
    transport: createZeroDevClient('bundler', chain.projectId),
  });

  const paymasterClient = createZeroDevPaymasterClient({
    chain: chain.viemChainObject,
    transport: createZeroDevClient('paymaster', chain.projectId),
  });

  const signer = privateKeyToAccount(ensureHex(PRIVATE_KEY));

  const kernelAccount = await signerToEcdsaKernelSmartAccount(publicClient, {
    entryPoint: ENTRYPOINT,
    signer: signer,
    index: 0n,
  });

  const smartAccountClient = createSmartAccountClient({
    account: kernelAccount,
    chain: chain.viemChainObject,
    transport: createZeroDevClient('bundler', chain.projectId),
    sponsorUserOperation: paymasterClient.sponsorUserOperation,
  });

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

  const op = await smartAccountClient.prepareUserOperationRequest({
    userOperation: {
      callData: await kernelAccount.encodeCallData({
        to: DEPLOYER_CONTRACT_ADDRESS,
        data: ensureHex(salt + bytecode.slice(2)),
        value: 0n,
      }),
    },
  });

  const opHash = await smartAccountClient.sendUserOperation({
    userOperation: op,
  });

  return [getAddress(result.data as string), opHash];
};

export const deployContracts = async (
  bytecode: Hex,
  chains: Chain[],
  salt: Hex,
  expectedAddress: string | undefined
) => {
  const deploymentStatus: Record<
    string,
    { status: string; result?: string; txHash?: string }
  > = {};
  chains.forEach((chain) => {
    deploymentStatus[chain.name] = { status: 'starting...' };
  });

  const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
  let frameIndex = 0;

  const updateConsole = () => {
    console.clear();
    console.log('Starting deployments...');
    chains.forEach((chain) => {
      const frame =
        deploymentStatus[chain.name].status === 'starting...'
          ? chalk.green(frames[frameIndex])
          : '';
      if (deploymentStatus[chain.name].status === 'done!') {
        console.log(
          `Contract deployed at ${deploymentStatus[chain.name].result} on ${
            chain.name
          } with transaction hash ${deploymentStatus[chain.name].txHash}`
        );
      } else {
        console.log(
          `${frame} Deployment for ${chain.name} is ${
            deploymentStatus[chain.name].status
          }`
        );
      }
    });
    frameIndex = (frameIndex + 1) % frames.length;
  };

  const interval = setInterval(updateConsole, 100);

  // TODO: describe status of each deployment regardless of error, user should be able to see which deployment succeeded and which failed
  const deployments = chains.map((chain) =>
    deployToChain(chain, bytecode, salt, expectedAddress)
      .then(([result, txHash]) => {
        deploymentStatus[chain.name] = { status: 'done!', result, txHash };
      })
      .catch((error) => {
        deploymentStatus[chain.name] = { status: `failed: ${error}` };
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
