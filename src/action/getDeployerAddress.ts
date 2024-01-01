import { privateKeyToAccount } from "viem/accounts"
import { ensureHex } from "../utils"
import { PRIVATE_KEY } from "../config"
import {
    Address,
    pad,
    encodeFunctionData,
    getContractAddress,
    keccak256,
    concat,
    slice
} from "viem"
export const getDeployerAddress = (): Address => {
    // find the first projectId set by the user
    const signer = privateKeyToAccount(ensureHex(PRIVATE_KEY))
    // bytes32 salt = bytes32(uint256(keccak256(abi.encodePacked(_data, _index))) & type(uint96).max);
    //KernelAccountAbi.("initialize", [
    //     "0xd9AB5096a832b9ce79914329DAEE236f8Eea0390",
    //     signer.address
    // ]);
    const KernelAccountAbi = [
        {
            inputs: [
                {
                    internalType: "contract IKernelValidator",
                    name: "_defaultValidator",
                    type: "address"
                },
                {
                    internalType: "bytes",
                    name: "_data",
                    type: "bytes"
                }
            ],
            name: "initialize",
            outputs: [],
            stateMutability: "payable",
            type: "function"
        }
    ] as const
    const data = encodeFunctionData({
        abi: KernelAccountAbi,
        functionName: "initialize",
        args: ["0xd9AB5096a832b9ce79914329DAEE236f8Eea0390", signer.address]
    })
    const salt = slice(keccak256(concat([data, pad("0x00")])), 20)
    const kernelAddress = getContractAddress({
        from: "0x5de4839a76cf55d0c90e2061ef4386d962E15ae3" as Address,
        bytecodeHash: ensureHex(
            "0xee9d8350bd899dd261db689aafd87eb8a30f085adbaff48152399438ff4eed73"
        ),
        opcode: "CREATE2",
        salt: salt
    })

    return kernelAddress
}
