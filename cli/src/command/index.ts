#!/usr/bin/env node
import figlet from 'figlet';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import { Command } from 'commander';
import {
  computeAddress,
  deployContract,
  getBalance,
  getDeployerAddress,
} from '../action';
import { PRIVATE_KEY, ZERODEV_PROJECT_ID } from '../config';
import { CHAIN_MAP, DEPLOYER_ADDRESS } from '../constant';

export const program = new Command();

const getDeployerAddressWithEnv = async () => {
  return await getDeployerAddress(ZERODEV_PROJECT_ID, PRIVATE_KEY);
};

program
  .name('ZeroDev-Multichain-Deployer')
  .description(
    'A CLI tool for deploying contracts to multichain with account abstraction'
  )
  .usage('zerodev <command> [options]')
  .version('1.0.0');

program.helpInformation = function () {
  const asciiArt = chalk.blueBright(
    figlet.textSync('ZeroDev Multichain Deployer', {
      horizontalLayout: 'default',
      verticalLayout: 'default',
      width: 100,
      whitespaceBreak: true,
    })
  );

  const originalHelpInformation = Command.prototype.helpInformation.call(this);
  return `${asciiArt}\n\n\n${originalHelpInformation}`;
};

program
  .command('chains')
  .description('Show the list of available chains')
  .action(() => {
    console.log('Available chains:');
    for (const chain in CHAIN_MAP) {
      console.log(chain);
    }
  });

program
  .command('compute-address')
  .description('Compute the address to be deployed')
  .argument('<path-to-bytecode>', 'file path of bytecode to deploy')
  .argument('<salt>', 'salt to be used for create2')
  .action((pathToBytecode: string, salt: string) => {
    const bytecode = fs.readFileSync(pathToBytecode, 'utf8');
    const address = computeAddress(DEPLOYER_ADDRESS, salt, bytecode);
    console.log(`computed address: ${address}`);
  });

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
  .argument('<path-to-bytecode>', 'file path of bytecode to deploy')
  .argument('<salt>', 'salt to be used for create2')
  .option(
    '-c, --chains [CHAINS]',
    'list of chains for deploying contracts, with all selected by default',
    'all'
  )
  .option('-e, --expected-address [ADDRESS]', 'expected address to confirm')
  .option('-v, --verify', 'verify contracts after deployment', false)
  .action((pathToBytecode, salt, options) => {
    const { chains, expectedAddress, verify } = options;
    const bytecode = fs.readFileSync(
      path.resolve(process.cwd(), pathToBytecode),
      'utf8'
    );

    deployContract(bytecode, salt, chains, expectedAddress, verify);
  });

program
  .command('create-session-key')
  .description('Create a session key')
  .action(() => console.log('need to implement'));
