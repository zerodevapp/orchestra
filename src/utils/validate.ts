import fs from 'fs';
import { Chain, getSupportedChains } from '../constant';

export const validateInputs = (
  bytecode: string,
  salt: string,
  expectedAddress: string | undefined,
  sessionKeyFilePath: string | undefined
) => {
  if (!/^0x[0-9a-fA-F]*$/.test(bytecode)) {
    throw new Error('Bytecode must be a hexadecimal string');
  }

  if (!/^0x[0-9a-fA-F]{64}$/.test(salt)) {
    throw new Error('Salt must be a 32 bytes hex string');
  }

  if (expectedAddress && !/^0x[0-9a-fA-F]{40}$/.test(expectedAddress)) {
    throw new Error('Expected address must be a 20 bytes hex string');
  }

  if (sessionKeyFilePath && !fs.existsSync(sessionKeyFilePath)) {
    throw new Error('Session key file does not exist');
  }
};

export const processAndValidateChains = (chainOption: string): Chain[] => {
  const supportedChains = getSupportedChains();

  const chains =
    chainOption === 'all'
      ? supportedChains.map((chain) => chain.name)
      : chainOption.split(',');

  const chainObjects: Chain[] = chains.map((chainName: string) => {
    const chain = supportedChains.find((c) => c.name === chainName);
    if (!chain) throw new Error(`Chain ${chainName} is not supported`);
    return chain;
  });

  validateChains(chainObjects);
  return chainObjects;
};

const validateChains = (chains: Chain[]) => {
  for (const chain of chains) {
    if (!chain.projectId) {
      throw new Error(`PROJECT_ID for chain ${chain.name} is not specified`);
    }
  }
};
