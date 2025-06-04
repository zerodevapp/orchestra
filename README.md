# Orchestra

Orchestra is a CLI for deterministically deploying contracts to multiple chains, even if you don't have gas tokens for each chain. It's able to do that thanks to ERC-4337 paymasters. Orchestra is built on [ZeroDev](https://docs.zerodev.app/).

## Installation

1. `npm install -g @zerodev/orchestra`
2. Create a `.env` file based on `.env.example`
   - You can acquire the project IDs from [the ZeroDev dashboard](https://dashboard.zerodev.app/)
   - Use [this link](https://dashboard.zerodev.app/account/api-key) to get the API key for the team
3. Test the installation by running `zerodev -h`

## Usage

### Deploying a Contract

- Before deployment, make sure that you have the bytecode of the contract you want to deploy
- You can deploy a contract to multiple chains with the following command

```
zerodev deploy [options]
```

- For example, if you want to deploy a contract to the Optimism Sepolia and Polygon Mumbai testnet with `bytecode` file and zero bytes `salt`, you can run the following command

```
zerodev deploy -f ./bytecode -s 0 -c optimism-sepolia,polygon-mumbai
```

- if you want to deploy to all testnets or all mainnets, use `-t` `--testnet-all` / `-m` `--mainnet-all` flag instead of `-c` `--chain` flag

```
zerodev deploy -f ./bytecode -s 0 -t
```

```
zerodev deploy -f ./bytecode -s 0 -m
```

- After deployment, you can see the deployed contract address and its user operation hash with jiffy scan link.

### Available Commands

All commands should be prefixed with `zerodev`

- `-h`, `--help`: Show help
- `chains`: Show the list of available chains
- `compute-address [options]`: Compute the address to be deployed
  - `-f, --file <path-to-bytecode>`: file path of bytecode to deploy
  - `-b, --bytecode <bytecode>`: bytecode to deploy, should have constructor arguments encoded
  - `-s, --salt <salt>`: salt to use for deployment, this can be a full 32-byte hex string or a shorter numeric representation that will be converted to a 32-byte hex string.
- `get-deployer-address`: Get the deployer's address
- `deploy [options]`: Deploy contracts deterministically using CREATE2, in order of the chains specified
  - `-f, --file <path-to-bytecode>`: file path of bytecode to deploy
  - `-b, --bytecode <bytecode>`: bytecode to deploy, should have constructor arguments encoded
  - `-s, --salt <salt>`: salt to use for deployment, this can be a full 32-byte hex string or a shorter numeric representation that will be converted to a 32-byte hex string.
  - `-t, --testnet-all`: deploy to all testnets
  - `-m, --mainnet-all`: deploy to all mainnets
  - `-c, --chains [CHAINS]`: list of chains to deploy, with `all` selected by default
  - `-e, --expected-address <address>`: expected address to confirm
  - `-v, --verify <CONTRACT_NAME>`: contract name to be verified
  - `-g, --call-gas-limit <call-gas-limit>`: gas limit for the call
- `check-deployment [options]`: Check if the contract has been deployed on the specified chains
  - `-f, --file <path-to-bytecode>`: file path of bytecode used for deployment
  - `-b, --bytecode <bytecode>`: bytecode to deploy, should have constructor arguments encoded
  - `-s, --salt <salt>`: salt to use for deployment, this can be a full 32-byte hex string or a shorter numeric representation that will be converted to a 32-byte hex string.
  - `-c, --chains [CHAINS]`: list of chains to check, with `all` selected by default
  - `-t, --testnet-all`: check all testnets
  - `-m, --mainnet-all`: check all mainnets
- `clear-log`: Clear the log files
- `generate-salt`: Generate a random 32 bytes salt, or convert the input to salt
  - `-i, --input <input>`: input to convert to 32 bytes salt(ex. if input is given as `0`, returns `0x0000000000000000000000000000000000000000000000000000000000000000`)
- `help [command]`: display help for command

## Supported Networks

Orchestra supports all network supported by ZeroDev. Check details [here](https://docs.zerodev.app/supported-networks)

## Help Wanted

- Orchestra can in principle run on any AA infra, but since ERC-4337 paymasters tend to be incompatible across vendors, currently Orchestra only support ZeroDev paymasters. We welcome PRs to add support for other AA infra providers. To do so, you would first add support for other infra providers to [Kernel.js](https://github.com/zerodevapp/kernel), which Orchestra is built on top of. Feel free to [reach out to us](https://discord.gg/KS9MRaTSjx) if you need help with this task.
