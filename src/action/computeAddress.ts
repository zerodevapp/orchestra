import { Address, Hex, getContractAddress } from "viem"

export const computeAddress = (
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
