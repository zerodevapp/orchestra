import { keccak256, toBytes, getAddress } from 'viem';

// TODO: check if this works correctly
export const computeAddress = (
  creatorAddress: string,
  salt: string,
  bytecode: string
): string => {
  const create2Inputs = [
    '0xff',
    creatorAddress,
    salt,
    keccak256(toBytes(bytecode)),
  ];

  const create2Hash = keccak256(
    Buffer.concat(create2Inputs.map((x) => toBytes(x)))
  );
  return getAddress('0x' + create2Hash.slice(-40));
};
