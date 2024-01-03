import {
    createKernelAccount,
    createKernelPaymasterClient
} from "@kerneljs/core"
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
    const publicClient = createPublicClient({
        transport: http(getZeroDevBundlerRPC(chain.projectId))
    })

    const signer = privateKeyToAccount(PRIVATE_KEY)

    const ecdsaValidator = await signerToEcdsaValidator(publicClient, {
        signer
    })

    const account = await createKernelAccount(publicClient, {
        plugin: ecdsaValidator
    })

    return createSmartAccountClient({
        account,
        chain: chain.viemChainObject,
        transport: http(getZeroDevBundlerRPC(chain.projectId)),
        sponsorUserOperation: async ({
            userOperation
        }): Promise<UserOperation> => {
            const kernelPaymaster = createKernelPaymasterClient({
                chain: chain.viemChainObject,
                transport: http(getZeroDevPaymasterRPC(chain.projectId))
            })
            return kernelPaymaster.sponsorUserOperation({
                userOperation
            })
        }
    })
}
