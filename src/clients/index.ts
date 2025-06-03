export const getZeroDevBundlerRPC = (
    chainId: number,
    provider?: string
): string => {
    let rpc = `https://rpc.zerodev.app/api/v3/${process.env.ZERODEV_PROJECT_ID}/chain/${chainId}`
    if (provider) {
        rpc += `?provider=${provider}`
    }
    return rpc
}
export const getZeroDevPaymasterRPC = (
    chainId: number,
    provider?: string
): string => {
    let rpc = `https://rpc.zerodev.app/api/v3/${process.env.ZERODEV_PROJECT_ID}/chain/${chainId}`
    if (provider) {
        rpc += `?provider=${provider}`
    }
    return rpc
}
export * from "./createKernelClient.js"
