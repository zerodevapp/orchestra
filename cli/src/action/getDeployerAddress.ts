import { ECDSAProvider } from '@zerodev/sdk';
import { LocalAccountSigner } from '@alchemy/aa-core';

export const getDeployerAddress = async (
  projectId: string,
  privateKey: string
) => {
  const formattedPrivateKey = privateKey.startsWith('0x')
    ? privateKey
    : `0x${privateKey}`;

  const ecdsaProvider = await ECDSAProvider.init({
    projectId,
    owner: LocalAccountSigner.privateKeyToAccountSigner(
      formattedPrivateKey as `0x${string}`
    ),
  });

  return await ecdsaProvider.getAddress();
};
