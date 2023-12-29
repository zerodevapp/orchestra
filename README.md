# Contract Deployment Tool

This tool is a command line tool that allows you to deploy contracts to multiple chains deterministically with a single command. It uses the [ZeroDev](https://zerodev.app) service to deploy contracts.

## Configuration

1. Inside the `cli` directory, create a `.env` file and fill it out by refering to `.env.example.`
2. Run `pnpm install` to install all the necessary dependencies.
3. Run `pnpm build` to build the project.
4. Run `pnpm link --global` to make the command accessible globally.
5. Test the installation by running `zerodev -h`. If you see a guide for the command, it means the installation was successful.

## Usage

### Deploying a Contract

- Before deployment, make sure that you have the bytecode file of the contract you want to deploy
- You can deploy a contract to multiple chains with the following command

```
zerodev deploy [options] <path-to-bytecode> <salt>
```

- For example, if you want to deploy a contract to the Optimism Sepolia and Polygon Mumbai testnet(if you want to deploy to all testnets, use `-t` `--testnet-all` flag instead of `-c` `--chain` flag) with `bytecode` file and zero bytes `salt`, you can run the following command

```
zerodev deploy ./bytecode 0x0000000000000000000000000000000000000000000000000000000000000000 -c optimism-sepolia,polygon-mumbai

```

- After deployment, you can see the deployed contract address and its transaction hash.

### Available Commands

All commands should be prefixed with `zerodev`

- `-h`, `--help`: Show help
- `chains`: Show the list of available chains
- `compute-address <path-to-bytecode> <salt>`: Compute the address to be deployed
- `get-deployer-address`: Get the deployer's address
- `deploy [options] <path-to-bytecode> <salt>`: Deploy contracts deterministically using CREATE2, in order of the chains specified
- `check-deployment [options] <path-to-bytecode> <salt>`: Check if the contract has been deployed on the specified chains
- `help [command]`: display help for command

## Supported Networks

This tool supports all network supported by ZeroDev. Check details [here](https://docs.zerodev.app/supported-networks)
