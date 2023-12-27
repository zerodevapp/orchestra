import fs from 'fs';
import { SUPPORTED_CHAINS_MAP } from '../constant';

export const validateInputs = (
  bytecode: string,
  salt: string,
  expectedAddress: string,
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

  chains.forEach((chain: string) => {
    if (!(chain in SUPPORTED_CHAINS_MAP)) {
      throw new Error(`chain ${chain} not supported`);
    }
  });

  if (sessionKeyFilePath && !fs.existsSync(sessionKeyFilePath)) {
    throw new Error('Session key file does not exist');
  }
};
