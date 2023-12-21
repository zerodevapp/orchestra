#!/usr/bin/env node
import { Command } from 'commander';
import { deployContract, getBalance, getDeployerAddress } from '../action';

export const program = new Command();

const getDeployerAddressWithEnv = async () => {
  return await getDeployerAddress(
    process.env.PROJECT_ID ?? '',
    process.env.PRIVATE_KEY ?? ''
  );
};

program
  .name('ZeroDev-Multichain-Deployer')
  .description('A CLI tool for deploying contracts to multichain easily.')
  .usage('zerodev <command> [options]')
  .version('1.0.0');

program
  .command('get-deployer-address')
  .description("Get the deployer's address")
  .action(async () => {
    const address = await getDeployerAddressWithEnv();
    console.log(`deployer address: ${address}`);
  });

program
  .command('get-balance')
  .description('Get the deployer USDC balance')
  .action(async () => {
    const address = await getDeployerAddressWithEnv();
    const balance = await getBalance(address);
    console.log(`remaining balance: ${balance} USDC`);
  });

program
  .command('deploy')
  .description(
    'Deploy contracts deterministically using create2, in order of the chains specified'
  )
  .argument('<path-to-bytecode>', 'bytecode to deploy')
  .option('-r, --rpc-url <RPC_URL>', 'rpc url to be used for deployment')
  .option('-c, --chains [CHAINS]', 'chains to deploy to', 'all')
  .option('-e, --expected-address [ADDRESS]', 'expected address to confirm')
  .option('-t, --testnet', 'deploy to testnet')
  .option('-v, --verify', 'verify contracts after deployment')
  .action((pathToBytecode, options) => {
    const { rpcUrl, chains, expectedAddress, testnet, verify } = options;
    const bytecode = require(pathToBytecode);

    deployContract(bytecode, chains);
  });

program
  .command('create-session-key')
  .description('Create a session key')
  .action(() => console.log('need to implement'));
