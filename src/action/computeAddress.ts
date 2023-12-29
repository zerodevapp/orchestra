import { Hex, getContractAddress } from 'viem';

export const computeAddress = (from: Hex, bytecode: Hex, salt: Hex): Hex => {
  return getContractAddress({
    bytecode,
    from,
    opcode: 'CREATE2',
    salt,
  });
};
