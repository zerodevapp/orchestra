import { Command } from "commander"

// Define proper types for command options
export type CommandOption = {
    flags: string
    description: string
    defaultValue?: string | boolean | string[] | undefined
}

// Extend Command class to add fluent API
declare module "commander" {
    interface Command {
        addOptions(options: CommandOption[]): Command
    }
}

Command.prototype.addOptions = function (options: CommandOption[]) {
    for (const option of options) {
        this.option(option.flags, option.description, option.defaultValue)
    }
    return this
}

// Common options
export const chainSelectionOptions: CommandOption[] = [
    {
        flags: "-t, --testnet-all",
        description: "select all testnets",
        defaultValue: false
    },
    {
        flags: "-m, --mainnet-all",
        description: "select all mainnets",
        defaultValue: false
    },
    {
        flags: "-a, --all-networks",
        description: "select all networks",
        defaultValue: false
    },
    { flags: "-c, --chains [CHAINS]", description: "list of chains to deploy" }
]

export const codeOptions: CommandOption[] = [
    {
        flags: "-f, --file <path-to-bytecode>",
        description:
            "file path of bytecode to deploy, a.k.a. init code, or a JSON file containing the bytecode of the contract (such as the output file by Forge), in which case it's assumed that the constructor takes no arguments."
    },
    { flags: "-b, --bytecode <bytecode>", description: "bytecode to deploy" },
    {
        flags: "-s, --salt <salt>",
        description:
            "salt to be used for CREATE2. This can be a full 32-byte hex string or a shorter numeric representation that will be converted to a 32-byte hex string."
    }
]

export const deployOptions: CommandOption[] = [
    {
        flags: "-e, --expected-address [ADDRESS]",
        description: "expected address to confirm"
    },
    {
        flags: "-v, --verify-contract [CONTRACT_NAME]",
        description: "verify the deployment on Etherscan"
    },
    {
        flags: "-g, --call-gas-limit <call-gas-limit>",
        description: "gas limit for the call"
    }
]

export const mirrorOption: CommandOption = {
    flags: "-f, --from-chain <chain>",
    description: "source chain to mirror from"
}
