# Orchestra

Orchestra is a CLI for deterministically deploying contracts to multiple chains, even if you don't have gas tokens for each chain. It's able to do that thanks to ERC-4337 paymasters. Orchestra is built on [ZeroDev](https://docs.zerodev.app/).

## Installation

1. Inside the `cli` directory, create a `.env` file and fill it out by refering to `.env.example.`
    - At the moment, Orchestra works only with ZeroDev infra, so you would fill out the `.env` file with ZeroDev project IDs that you can create on [the ZeroDev dashboard](https://dashboard.zerodev.app/). We welcome PRs to add support for other AA infra providers.
2. Run `bun install` to install all the necessary dependencies.
3. Run `bun run build` to build the project.
4. Run `bun link` to make the command `zerodev` accessible globally.
5. Test the installation by running `zerodev -h`. If you see a guide for the command, it means the installation was successful.

## Usage

### Deploying a Contract

-   Before deployment, make sure that you have the bytecode of the contract you want to deploy
-   You can deploy a contract to multiple chains with the following command

```
zerodev deploy [options] <salt>
```

-   For example, if you want to deploy a contract to the Optimism Sepolia and Polygon Mumbai testnet with `bytecode` file and zero bytes `salt`, you can run the following command

```
zerodev deploy 0x0000000000000000000000000000000000000000000000000000000000000000 -f ./bytecode -c optimism-sepolia,polygon-mumbai

```

-   if you want to deploy to all testnets or all mainnets, use `-t` `--testnet-all` / `-m` `--mainnet-all` flag instead of `-c` `--chain` flag

```
zerodev deploy 0x0000000000000000000000000000000000000000000000000000000000000000 -f ./bytecode -t
```

```
zerodev deploy 0x0000000000000000000000000000000000000000000000000000000000000000 -f ./bytecode -m
```

-   After deployment, you can see the deployed contract address and its user operation hash with jiffy scan link.

### Available Commands

All commands should be prefixed with `zerodev`

-   `-h`, `--help`: Show help
-   `chains`: Show the list of available chains
-   `compute-address [options] <salt>`: Compute the address to be deployed
    -   `-f, --file <path-to-bytecode>`: file path of bytecode to deploy
    -   `-b, --bytecode <bytecode>`: bytecode to deploy, should have constructor arguments encoded
-   `get-deployer-address`: Get the deployer's address
-   `deploy [options] <salt>`: Deploy contracts deterministically using CREATE2, in order of the chains specified
    -   `-f, --file <path-to-bytecode>`: file path of bytecode to deploy
    -   `-b, --bytecode <bytecode>`: bytecode to deploy, should have constructor arguments encoded
    -   `-t, --testnet-all`: deploy to all testnets
    -   `-m, --mainnet-all`: deploy to all mainnets
    -   `-c, --chains [CHAINS]`: list of chains to deploy, with `all` selected by default
    -   `-e, --expected-address <address>`: expected address to confirm
-   `check-deployment [options] <salt>`: Check if the contract has been deployed on the specified chains
    -   `-f, --file <path-to-bytecode>`: file path of bytecode used for deployment
    -   `-b, --bytecode <bytecode>`: bytecode to deploy, should have constructor arguments encoded
    -   `-c, --chains [CHAINS]`: list of chains to check, with `all` selected by default
    -   `-t, --testnet-all`: check all testnets
    -   `-m, --mainnet-all`: check all mainnets
-   `clear-log`: Clear the log files
-   `generate-salt`: Generate a random 32 bytes salt, or convert the input to salt
    -   `-i, --input <input>`: input to convert to 32 bytes salt(ex. if input is given as `0`, returns `0x0000000000000000000000000000000000000000000000000000000000000000`)
-   `help [command]`: display help for command

## Supported Networks

Orchestra supports all network supported by ZeroDev. Check details [here](https://docs.zerodev.app/supported-networks)
