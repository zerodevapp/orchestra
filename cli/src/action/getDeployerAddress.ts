import { ECDSAProvider } from '@zerodev/sdk';
import { LocalAccountSigner } from '@alchemy/aa-core';
import { ensureHex } from '../utils';

export const getDeployerAddress = async (
  projectId: string,
  privateKey: string
) => {
  const formattedPrivateKey = ensureHex(privateKey);

  const ecdsaProvider = await ECDSAProvider.init({
    projectId,
    owner: LocalAccountSigner.privateKeyToAccountSigner(formattedPrivateKey),
  });

  return await ecdsaProvider.getAddress();
};
