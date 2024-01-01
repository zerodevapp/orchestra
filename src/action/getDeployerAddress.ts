import { privateKeyToAccount } from "viem/accounts"
import { signerToEcdsaKernelSmartAccount } from "permissionless/accounts"
import { ENTRYPOINT } from "../constant"
import { ensureHex } from "../utils"
import { PRIVATE_KEY } from "../config"
import { Address } from "viem"
export const getDeployerAddress = async () => {
    // find the first projectId set by the user

    const signer = privateKeyToAccount(ensureHex(PRIVATE_KEY))

    const kernel = await signerToEcdsaKernelSmartAccount(publicClient, {
        entryPoint: ENTRYPOINT as Address,
        signer: signer,
        index: 100n
    })

    return kernel.address
}
