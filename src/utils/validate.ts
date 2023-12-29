import fs from 'fs';
import { Chain, SUPPORTED_CHAINS } from '../constant';

export const validateInputs = (
  bytecode: string,
  salt: string,
  expectedAddress: string | undefined,
  chains: string[],
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

  for (const chain of chains) {
    if (!SUPPORTED_CHAINS.map((chain) => chain.name).includes(chain)) {
      throw new Error(`Chain ${chain} is not supported`);
    }
  }

  if (sessionKeyFilePath && !fs.existsSync(sessionKeyFilePath)) {
    throw new Error('Session key file does not exist');
  }
};

export const validateRpcUrl = (chains: Chain[]) => {
  for (const chain of chains) {
    if (!chain.rpcUrl) {
      throw new Error(`RPC url for chain ${chain.name} is not specified`);
    }
  }
};
