import { createSmartAccountClient } from 'permissionless';
import { signerToEcdsaKernelSmartAccount } from 'permissionless/accounts';
import {
  createPimlicoPaymasterClient,
  createPimlicoBundlerClient,
} from 'permissionless/clients/pimlico';
import { createPublicClient, getContract, http, parseEther } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { DEPLOYER_ABI, DEPLOYER_ADDRESS, ENTRYPOINT } from '../constant';
import { PIMLICO_API_KEY, PRIVATE_KEY, RPC_PROVIDER_API_KEY } from '../config';
import { CHAIN_MAP } from '../constant';
import { ensureHex } from '../utils';

const buildUrl = (
  base: string,
  chain: string,
  version: string,
  apiKey: string
) => `https://${base}/${version}/${chain}/rpc?apikey=${apiKey}`;

const createClient = (
  chain: string,
  base: string,
  version: string,
  apiKey: string
) => {
  return http(buildUrl(base, chain, version, apiKey));
};

export const deployContract = async (
  bytecode: string,
  chains: string[],
  salt: string,
  expectedAddress: string,
  verify: boolean
) => {
  const deployments = chains.map(async (chain) => {
    if (!(chain in CHAIN_MAP)) {
      throw new Error(`chain ${chain} not supported`);
    }

    const publicClient = createPublicClient({
      transport: createClient(chain, 'infura.io', 'v3', RPC_PROVIDER_API_KEY),
    });
    const paymasterClient = createPimlicoPaymasterClient({
      transport: createClient(chain, 'api.pimlico.io', 'v2', PIMLICO_API_KEY),
    });
    const signer = privateKeyToAccount(ensureHex(PRIVATE_KEY));

    const kernelAccount = await signerToEcdsaKernelSmartAccount(publicClient, {
      entryPoint: ENTRYPOINT,
      signer: signer,
      index: 0n,
    });

    const smartAccountClient = createSmartAccountClient({
      account: kernelAccount,
      chain: CHAIN_MAP[chain as keyof typeof CHAIN_MAP],
      transport: createClient(chain, 'api.pimlico.io', 'v1', PIMLICO_API_KEY),
      sponsorUserOperation: paymasterClient.sponsorUserOperation,
    });

    const bundlerClient = createPimlicoBundlerClient({
      transport: createClient(chain, 'api.pimlico.io', 'v1', PIMLICO_API_KEY),
    });

    const gasPrices = await bundlerClient.getUserOperationGasPrice();
    if (
      gasPrices.fast.maxFeePerGas === undefined ||
      gasPrices.fast.maxPriorityFeePerGas === undefined
    ) {
      throw new Error('gas prices not available');
    }

    const deployerContract = getContract({
      address: DEPLOYER_ADDRESS,
      abi: DEPLOYER_ABI,
      publicClient,
      walletClient: smartAccountClient,
    });

    const txHash = await deployerContract.write.deploy([
      parseEther('0'),
      '0x' + '00'.repeat(32),
      bytecode,
    ]);

    console.log(
      `Contract deployed to ${chain} with transaction hash ${txHash}`
    );
  });

  await Promise.all(deployments);
};
