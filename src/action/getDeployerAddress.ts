import { ECDSAProvider } from '@zerodev/sdk';
import { LocalAccountSigner } from '@alchemy/aa-core';
import { ensureHex } from '../utils';
import { PRIVATE_KEY } from '../config';
import { getSupportedChains } from '../constant';

export const getDeployerAddress = async () => {
  // find the first projectId set by the user
  const availableProjectId = getSupportedChains().find(
    (chain) => chain.projectId !== null
  )?.projectId;

  if (!availableProjectId) {
    throw new Error('Please set PROJECT_ID for at least one chain in .env');
  }

  const ecdsaProvider = await ECDSAProvider.init({
    projectId: availableProjectId,
    owner: LocalAccountSigner.privateKeyToAccountSigner(ensureHex(PRIVATE_KEY)),
  });

  return await ecdsaProvider.getAddress();
};
