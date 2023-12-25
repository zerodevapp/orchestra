import { LocalAccountSigner } from '@alchemy/aa-core';
import { ensureHex } from '../utils';
import {
  ECDSAProvider,
  ParamOperator,
  SessionKeyProvider,
  getPermissionFromABI,
} from '@zerodev/sdk';
import { DEPLOYER_ABI, DEPLOYER_CONTRACT_ADDRESS } from '../constant';
import { zeroAddress } from 'viem';
import { generatePrivateKey } from 'viem/accounts';

export const generateSessionKey = async (
  projectId: string,
  privateKey: string
) => {
  const formattedPrivateKey = ensureHex(privateKey);

  const owner =
    LocalAccountSigner.privateKeyToAccountSigner(formattedPrivateKey);

  // Create the AA wallet
  const ecdsaProvider = await ECDSAProvider.init({
    projectId,
    owner,
  });

  // Generate a private key to use as the session key
  const sessionKey = LocalAccountSigner.privateKeyToAccountSigner(
    generatePrivateKey()
  );

  // Each permission can be considered a "rule" for interacting with a particular
  // contract/function.  To create a key that can interact with multiple
  // contracts/functions, set up one permission for each.
  const permissions = [
    getPermissionFromABI({
      // Target contract to interact with
      target: DEPLOYER_CONTRACT_ADDRESS,
      // Maximum value that can be transferred.  In this case we
      // set it to zero so that no value transfer is possible.
      valueLimit: BigInt(0),
      // Contract abi
      abi: DEPLOYER_ABI,
      functionName: 'deploy',
      // An array of conditions, each corresponding to an argument for
      // the function.
      args: [
        // {
        //   // In this case, we are saying that the address must be equal
        //   // to the given value.
        //   operator: ParamOperator.EQUAL,
        //   value: address,
        // },
      ],
    }),
  ];

  const sessionKeyProvider = await SessionKeyProvider.init({
    // ZeroDev project ID
    projectId,
    // Pass the ECDSAProvider as default provider
    defaultProvider: ecdsaProvider,
    // the session key (private key)
    sessionKey,
    // session key parameters
    sessionKeyData: {
      // The UNIX timestamp at which the session key becomes valid
      validAfter: 0,
      // The UNIX timestamp at which the session key becomes invalid
      validUntil: 0,
      // The permissions
      permissions,
      // The "paymaster" param specifies whether the session key needs to
      // be used with a specific paymaster.
      // Without it, the holder of the session key can drain ETH from the
      // account by spamming transactions and wasting gas, so it's recommended
      // that you specify a trusted paymaster.
      //
      // address(0) means it's going to work with or without paymaster
      // address(1) works only with paymaster
      // address(paymaster) works only with the specified paymaster
      paymaster: zeroAddress,
    },
  });

  console.log(sessionKeyProvider);
};
