import type {
  Account,
  Address,
  Chain,
  Hex,
  PublicClientConfig,
  Transport,
} from 'viem';
import { Client, createClient } from 'viem';
import { type BundlerActions, bundlerActions } from 'permissionless';
import { deepHexlify } from 'permissionless';
import { UserOperation } from 'permissionless/types';
import { UserOperationWithBigIntAsHex } from 'permissionless/types/userOperation';

export const createZeroDevBundlerClient = <
  transport extends Transport,
  chain extends Chain | undefined = undefined
>(
  parameters: PublicClientConfig<transport, chain>
): ZeroDevBundlerClient => {
  const { key = 'public', name = 'ZeroDev Bundler Client' } = parameters;
  const client = createClient({
    ...parameters,
    key,
    name,
    type: 'zerodevBundlerClient',
  });
  return client.extend(bundlerActions);
};

export const createZeroDevPaymasterClient = <
  transport extends Transport,
  chain extends Chain | undefined = undefined
>(
  parameters: PublicClientConfig<transport, chain>
): ZeroDevPaymasterClient => {
  const { key = 'public', name = 'ZeroDev Paymaster Client' } = parameters;
  const client = createClient({
    ...parameters,
    key,
    name,
    type: 'zerodevPaymasterClient',
  });
  return client.extend(zerodevPaymasterActions);
};

export type ZeroDevBundlerClient = Client<
  Transport,
  Chain | undefined,
  Account | undefined,
  undefined,
  BundlerActions
>;

export type ZeroDevPaymasterClient = Client<
  Transport,
  Chain | undefined,
  Account | undefined,
  undefined,
  ZeroDevPaymasterClientActions
>;

export type SponsorUserOperationReturnType = UserOperation;

export const zerodevPaymasterActions = (
  client: Client
): ZeroDevPaymasterClientActions => ({
  sponsorUserOperation: async (args: ZeroDevSponsorUserOperationParameters) =>
    sponsorUserOperation(client as ZeroDevPaymasterClient, args),
});

export const sponsorUserOperation = async <
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends Account | undefined = Account | undefined
>(
  client: Client<TTransport, TChain, TAccount, ZeroDevPaymasterRpcSchema>,
  args: ZeroDevSponsorUserOperationParameters
): Promise<SponsorUserOperationReturnType> => {
  const response = await client.request({
    method: 'zd_sponsorUserOperation',
    params: [
      {
        chainId: client.chain?.id!,
        userOp: deepHexlify(args.userOperation) as UserOperationWithBigIntAsHex,
        entryPointAddress: args.entryPoint,
        shouldOverrideFee: true,
        shouldConsume: true,
      },
    ],
  });

  const userOperation: UserOperation = {
    ...args.userOperation,
    paymasterAndData: response.paymasterAndData,
    preVerificationGas: BigInt(response.preVerificationGas),
    verificationGasLimit: BigInt(response.verificationGasLimit),
    callGasLimit: BigInt(response.callGasLimit),
  };

  return userOperation;
};

export type ZeroDevPaymasterClientActions = {
  sponsorUserOperation: (
    args: ZeroDevSponsorUserOperationParameters
  ) => Promise<SponsorUserOperationReturnType>;
};
export type ZeroDevSponsorUserOperationParameters = {
  userOperation: UserOperation;
  entryPoint: Address;
  sponsorshipPolicyId?: string;
};

export type ZeroDevPaymasterRpcSchema = [
  {
    Method: 'zd_sponsorUserOperation';
    Parameters: [
      {
        chainId: number;
        userOp: UserOperationWithBigIntAsHex;
        entryPointAddress: Address;
        shouldOverrideFee: boolean;
        shouldConsume: boolean;
      }
    ];
    ReturnType: {
      paymasterAndData: Hex;
      preVerificationGas: Hex;
      verificationGasLimit: Hex;
      callGasLimit: Hex;
    };
  }
];
