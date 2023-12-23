import { createSmartAccountClient } from 'permissionless';
import { signerToEcdsaKernelSmartAccount } from 'permissionless/accounts';
import {
  createPimlicoPaymasterClient,
  createPimlicoBundlerClient,
} from 'permissionless/clients/pimlico';
import { createPublicClient, http, parseEther } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import {
  DEPLOYER_ABI,
  DEPLOYER_ADDRESS,
  ENTRYPOINT,
  SUPPORTED_CHAINS_MAP,
  getChainObject,
} from '../constant';
import { PIMLICO_API_KEY, PRIVATE_KEY, RPC_PROVIDER_API_KEY } from '../config';
import { ensureHex } from '../utils';

const PIMLICO_BASE_URL = 'api.pimlico.io';
const PIMLICO_VERSION = 'v1';

const buildUrlForInfura = (baseUrl: string) =>
  `https://${baseUrl}/${RPC_PROVIDER_API_KEY}`;

const buildUrlForPimlico = (chain: string) =>
  `https://${PIMLICO_BASE_URL}/${PIMLICO_VERSION}/${chain}/rpc?apikey=${PIMLICO_API_KEY}`;

const createPimlicoClient = (chain: string) => http(buildUrlForPimlico(chain));

const createDeployment = async (
  chain: string,
  bytecode: string,
  salt: string,
  expectedAddress: string
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
    transport: createPimlicoClient(pimlicoChainKey),
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
    transport: createPimlicoClient(pimlicoChainKey),
    sponsorUserOperation: paymasterClient.sponsorUserOperation,
  });

  const bundlerClient = createPimlicoBundlerClient({
    transport: createPimlicoClient(pimlicoChainKey),
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
