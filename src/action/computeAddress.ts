import { keccak256, toBytes, getAddress, Hex } from 'viem';

export const computeAddress = (
  creatorAddress: string,
  bytecode: string,
  salt: string
): Hex => {
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
