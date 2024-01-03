export const getZeroDevBundlerRPC = (projectId: string): string => {
    let rpc = `https://rpc.zerodev.app/api/v2/bundler/${projectId}`
    return rpc
}
export const getZeroDevPaymasterRPC = (projectId: string): string => {
    let rpc = `https://rpc.zerodev.app/api/v2/paymaster/${projectId}`
    return rpc
}
export * from "./kernelAccountClient"
