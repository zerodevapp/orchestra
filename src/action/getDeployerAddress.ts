import {
    Address,
    Hex,
    concat,
    encodeFunctionData,
    getContractAddress,
    keccak256,
    pad,
    slice,
    toHex
} from "viem"
import { privateKeyToAccount } from "viem/accounts"
import { ensureHex } from "../utils/index.js"
export const getDeployerAddress = (privateKey: Hex, index: bigint): Address => {
    const signer = privateKeyToAccount(privateKey)
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
    ]

    const data = encodeFunctionData({
        abi: KernelAccountAbi,
        functionName: "initialize",
        args: ["0xd9AB5096a832b9ce79914329DAEE236f8Eea0390", signer.address]
    })
    const salt = slice(
        keccak256(concat([data, pad(index ? toHex(index) : "0x00")])),
        20
    )
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
