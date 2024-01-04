import {
    createEcdsaKernelAccountClient
} from "@kerneljs/presets/zerodev"
import { signerToEcdsaValidator } from "@kerneljs/ecdsa-validator"
import {
    SmartAccountClient,
    UserOperation,
    createSmartAccountClient
} from "permissionless"
import { http, createPublicClient } from "viem"
import { privateKeyToAccount } from "viem/accounts"
import { getZeroDevBundlerRPC, getZeroDevPaymasterRPC } from "../clients"
import { PRIVATE_KEY } from "../config"
import { Chain } from "../constant"

///@notice this only use ecdsa signer
export const createKernelAccountClient = async (
    chain: Chain
): Promise<SmartAccountClient> => {
    const signer = privateKeyToAccount(PRIVATE_KEY)
    return await createEcdsaKernelAccountClient({
        // required
        chain: chain.viemChainObject,
        projectId: chain.projectId,
        signer,
    
        // optional
        provider: "ALCHEMY", // defaults to a recommended provider
        index: BigInt(0), // defaults to 0
        usePaymaster: true, // defaults to true
      })
}
