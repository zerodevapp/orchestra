import { signerToEcdsaValidator } from "@zerodev/ecdsa-validator"
import {
    createKernelAccount,
    createKernelAccountClient,
    createZeroDevPaymasterClient
} from "@zerodev/sdk"
import { KERNEL_V3_1 } from "@zerodev/sdk/constants"
import { ENTRYPOINT_ADDRESS_V07 } from "permissionless/utils"
import type { Hex } from "viem"
import { http, createPublicClient} from "viem"
import { privateKeyToAccount } from "viem/accounts"
import type { Chain } from "../constant.js"
import { getZeroDevBundlerRPC, getZeroDevPaymasterRPC } from "./index.js"

export const createKernelClient = async (privateKey: Hex, chain: Chain) => {
    const entryPoint = ENTRYPOINT_ADDRESS_V07
    const rpcUrl = getZeroDevBundlerRPC(chain.projectId, "PIMLICO")
    const paymasterRpcUrl = getZeroDevPaymasterRPC(chain.projectId, "PIMLICO")

    const publicClient = createPublicClient({
        transport: http(rpcUrl)
    })
    const signer = privateKeyToAccount(privateKey)

    const ecdsaValidatorPlugin = await signerToEcdsaValidator(publicClient, {
        entryPoint,
        signer,
        kernelVersion: KERNEL_V3_1
    })

    const kernelAccount = await createKernelAccount(publicClient, {
        entryPoint,
        plugins: {
            sudo: ecdsaValidatorPlugin
        },
        kernelVersion: KERNEL_V3_1
    })

    const kernelClient = createKernelAccountClient({
        account: kernelAccount,
        chain: chain.viemChainObject,
        bundlerTransport: http(rpcUrl, {
            timeout: 60000 // 1 min
        }),
        middleware: {
            sponsorUserOperation: async ({ userOperation }) => {
                const zeroDevPaymasterClient = createZeroDevPaymasterClient({
                    chain: chain.viemChainObject,
                    transport: http(paymasterRpcUrl),
                    entryPoint
                })
                return zeroDevPaymasterClient.sponsorUserOperation({
                    userOperation,
                    entryPoint
                })
            }
        },
        entryPoint
    })

    return kernelClient
}
