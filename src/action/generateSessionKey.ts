import { LocalAccountSigner } from '@alchemy/aa-core';
import { ensureHex } from '../utils';
import {
  ECDSAProvider,
  ParamOperator,
  SessionKeyProvider,
  getPermissionFromABI,
} from '@zerodev/sdk';
import { DEPLOYER_CONTRACT_ADDRESS } from '../constant';
import { Hex, parseAbi, zeroAddress } from 'viem';
import { generatePrivateKey } from 'viem/accounts';

export const generateSessionKey = async (
  projectId: string,
  privateKey: Hex
): Promise<string> => {
  const owner = LocalAccountSigner.privateKeyToAccountSigner(privateKey);
  const ecdsaProvider = await ECDSAProvider.init({
    projectId,
    owner,
  });

  const sessionPrivateKey = generatePrivateKey();
  const sessionKey =
    LocalAccountSigner.privateKeyToAccountSigner(sessionPrivateKey);

  const permissions = [
    getPermissionFromABI({
      target: DEPLOYER_CONTRACT_ADDRESS,
      valueLimit: BigInt(0),
      abi: parseAbi([
        'function deploy(uint256 amount, bytes32 salt, bytes memory bytecode) external payable returns (address addr)',
      ]),
      functionName: 'deploy',
    }),
  ];

  const sessionKeyProvider = await SessionKeyProvider.init({
    projectId,
    defaultProvider: ecdsaProvider,
    sessionKey,
    sessionKeyData: {
      validAfter: 0,
      validUntil: 0,
      permissions,
      paymaster: zeroAddress,
    },
  });

  const serializedSessionKeyParams =
    await sessionKeyProvider.serializeSessionKeyParams(sessionPrivateKey);

  return serializedSessionKeyParams;
};
