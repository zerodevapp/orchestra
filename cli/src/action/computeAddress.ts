import { keccak256 } from 'js-sha3';
import { toBeArray, getAddress } from 'ethers';

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
    keccak256(toBeArray(bytecode)),
  ];

  const create2Hash = keccak256(
    Buffer.concat(create2Inputs.map((x) => toBeArray(x)))
  );
  return getAddress('0x' + create2Hash.slice(-40));
};
