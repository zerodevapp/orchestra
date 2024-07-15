export const getZeroDevBundlerRPC = (
    projectId: string,
    provider?: string
): string => {
    let rpc = `https://rpc.zerodev.app/api/v2/bundler/${projectId}`
    if (provider) {
        rpc += `?provider=${provider}`
    }
    return rpc
}
export const getZeroDevPaymasterRPC = (
    projectId: string,
    provider?: string
): string => {
    let rpc = `https://rpc.zerodev.app/api/v2/paymaster/${projectId}`
    if (provider) {
        rpc += `?provider=${provider}`
    }
    return rpc
}
export * from "./createKernelClient.js"
