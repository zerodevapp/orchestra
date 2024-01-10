import { createEcdsaKernelAccountClient } from "@kerneljs/presets/zerodev"
import { SmartAccountClient } from "permissionless"
import { Hex } from "viem"
import { privateKeyToAccount } from "viem/accounts"
import { Chain } from "../constant"

///@notice this only use ecdsa signer
export const createKernelAccountClient = async (
    privateKey: Hex,
    chain: Chain
): Promise<SmartAccountClient> => {
    const signer = privateKeyToAccount(privateKey)
    return await createEcdsaKernelAccountClient({
        // required
        chain: chain.viemChainObject,
        projectId: chain.projectId,
        signer,

        // optional
        index: BigInt(0), // defaults to 0
        usePaymaster: true // defaults to true
    })
}
