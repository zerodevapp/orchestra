import { type Address, type Hex, getContractAddress } from "viem"

export const computeContractAddress = (
    from: Hex,
    bytecode: Hex,
    salt: Hex
): Address => {
    return getContractAddress({
        bytecode,
        from,
        opcode: "CREATE2",
        salt
    })
}
