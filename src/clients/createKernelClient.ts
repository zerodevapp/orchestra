import { signerToEcdsaValidator } from "@zerodev/ecdsa-validator"
import {
    type KernelAccountClient,
    createKernelAccount,
    createKernelAccountClient,
    createZeroDevPaymasterClient
} from "@zerodev/sdk"
import { getUserOperationGasPrice } from "@zerodev/sdk"
import { KERNEL_V3_1, getEntryPoint } from "@zerodev/sdk/constants"
import type { Hex } from "viem"

import { http, createPublicClient } from "viem"
import { privateKeyToAccount } from "viem/accounts"
import type { ZerodevChain } from "../constant.js"
import { getZeroDevBundlerRPC, getZeroDevPaymasterRPC } from "./index.js"

export const createKernelClient = async (
    privateKey: Hex,
    chain: ZerodevChain
): Promise<KernelAccountClient> => {
    const rpcUrl = getZeroDevBundlerRPC(chain.id, "PIMLICO")
    const paymasterRpcUrl = getZeroDevPaymasterRPC(chain.id, "PIMLICO")
    const entryPoint = getEntryPoint("0.7")

    const publicClient = createPublicClient({
        chain: chain,
        transport: http(chain.rpcUrls.default.http[0])
    })
    const signer = privateKeyToAccount(privateKey)

    const ecdsaValidator = await signerToEcdsaValidator(publicClient, {
        signer,
        entryPoint,
        kernelVersion: KERNEL_V3_1
    })

    // Construct a Kernel account
    const account = await createKernelAccount(publicClient, {
        plugins: {
            sudo: ecdsaValidator
        },
        entryPoint,
        kernelVersion: KERNEL_V3_1
    })

    const zerodevPaymaster = createZeroDevPaymasterClient({
        chain: chain,
        transport: http(paymasterRpcUrl)
    })
    // Construct a Kernel account client
    const kernelClient = createKernelAccountClient({
        account: account,
        client: publicClient,
        chain: chain,
        bundlerTransport: http(rpcUrl),
        paymaster: {
            getPaymasterData(userOperation) {
                return zerodevPaymaster.sponsorUserOperation({ userOperation })
            }
        }
    })

    return kernelClient
}
