import { createSmartAccountClient } from 'permissionless';
import { signerToEcdsaKernelSmartAccount } from 'permissionless/accounts';
import {
  createPimlicoPaymasterClient,
  createPimlicoBundlerClient,
} from 'permissionless/clients/pimlico';
import { createPublicClient, http, parseEther } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { DEPLOYER_ABI, DEPLOYER_ADDRESS, ENTRYPOINT } from '../constant';
import { PIMLICO_API_KEY, PRIVATE_KEY, RPC_PROVIDER_API_KEY } from '../config';
import { CHAIN_MAP } from '../constant';
import { ensureHex } from '../utils';

const BASE_URL = 'api.pimlico.io';
const INFURA_BASE = 'infura.io';
const INFURA_VERSION = 'v3';
const PIMLICO_VERSION = 'v1';

const buildUrlForInfura = (chain: string) =>
  `https://${chain}.${INFURA_BASE}/${INFURA_VERSION}/${RPC_PROVIDER_API_KEY}`;

const buildUrlForPimlico = (chain: string) =>
  `https://${BASE_URL}/${PIMLICO_VERSION}/${chain}/rpc?apikey=${PIMLICO_API_KEY}`;

const createClient = (chain: string) => http(buildUrlForPimlico(chain));

const createDeployment = async (
  chain: string,
  bytecode: string,
  salt: string,
  expectedAddress: string
) => {
  const publicClient = createPublicClient({
    transport: http(buildUrlForInfura(chain)),
  });

  // TODO: generealize mapping
  const chainKey = chain === 'mainnet' ? 'ethereum' : chain;

  const paymasterClient = createPimlicoPaymasterClient({
    transport: createClient(chainKey),
  });

  const signer = privateKeyToAccount(ensureHex(PRIVATE_KEY));

  const kernelAccount = await signerToEcdsaKernelSmartAccount(publicClient, {
    entryPoint: ENTRYPOINT,
    signer: signer,
    index: 0n,
  });

  const smartAccountClient = createSmartAccountClient({
    account: kernelAccount,
    chain: CHAIN_MAP[chainKey as keyof typeof CHAIN_MAP],
    transport: createClient(chainKey),
    sponsorUserOperation: paymasterClient.sponsorUserOperation,
  });

  const bundlerClient = createPimlicoBundlerClient({
    transport: createClient(chainKey),
  });

  const gasPrices = await bundlerClient.getUserOperationGasPrice();
  if (
    gasPrices.fast.maxFeePerGas === undefined ||
    gasPrices.fast.maxPriorityFeePerGas === undefined
  ) {
    throw new Error('gas prices not available');
  }

  const { request, result } = await publicClient.simulateContract({
    address: DEPLOYER_ADDRESS,
    abi: DEPLOYER_ABI,
    functionName: 'deploy',
    args: [parseEther('0'), ensureHex(salt), bytecode],
    account: kernelAccount.address,
  });

  const txHash = await smartAccountClient.writeContract(request);

  if (expectedAddress && result !== expectedAddress) {
    console.warn(
      `Contract deployed at ${result} on ${chain} with transaction hash ${txHash} does not match expected address ${expectedAddress}`
    );
  }

  console.log(
    `Contract deployed at ${result} on ${chain} with transaction hash ${txHash}`
  );
};

export const deployContract = async (
  bytecode: string,
  chains: string[],
  salt: string,
  expectedAddress: string
) => {
  const deployments = chains.map((chain) =>
    createDeployment(chain, bytecode, salt, expectedAddress)
  );

  await Promise.all(deployments);
};
