#!/usr/bin/env node
import figlet from 'figlet';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import { Command } from 'commander';
import {
  computeAddress,
  deployContracts,
  generateSessionKey,
  getBalance,
  getDeployerAddress,
} from '../action';
import { PRIVATE_KEY, ZERODEV_PROJECT_ID } from '../config';
import { DEPLOYER_CONTRACT_ADDRESS, SUPPORTED_CHAINS_MAP } from '../constant';
import { ensureHex } from '../utils';

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
    figlet.textSync('ZeroDev Deployer', {
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
    console.log('[Available chains]');
    Object.keys(SUPPORTED_CHAINS_MAP).forEach((chain) =>
      console.log(`- ${chain}`)
    );
  });

program
  .command('compute-address')
  .description('Compute the address to be deployed')
  .argument('<path-to-bytecode>', 'file path of bytecode to deploy')
  .argument('<salt>', 'salt to be used for create2')
  .action((pathToBytecode: string, salt: string) => {
    const bytecode = fs.readFileSync(pathToBytecode, 'utf8');
    const address = computeAddress(DEPLOYER_CONTRACT_ADDRESS, salt, bytecode);
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
    'Deploy contracts deterministically using CREATE2, in order of the chains specified'
  )
  .argument('<path-to-bytecode>', 'file path of bytecode to deploy')
  .argument('<salt>', 'salt to be used for CREATE2')
  .option(
    '-c, --chains [CHAINS]',
    'list of chains for deploying contracts, with all selected by default',
    'all'
  )
  .option('-e, --expected-address [ADDRESS]', 'expected address to confirm')
  .option(
    '-s, --session-key-file-path [KEY]',
    'session key file path to use for deployment'
  )
  .action(async (pathToBytecode: string, salt: string, options) => {
    let { chains, expectedAddress, sessionKeyFilePath } = options;
    const bytecode = fs.readFileSync(
      path.resolve(process.cwd(), pathToBytecode),
      'utf8'
    );

    if (!/^0x[0-9a-fA-F]{64}$/.test(salt)) {
      throw new Error('Salt must be a 32 bytes hex string');
    }

    if (expectedAddress && !/^0x[0-9a-fA-F]{40}$/.test(expectedAddress)) {
      throw new Error('Expected address must be a 20 bytes hex string');
    }

    if (chains === 'all') {
      chains = Object.keys(SUPPORTED_CHAINS_MAP);
    } else {
      chains = chains.split(',');
    }

    chains.map((chain: string) => {
      if (!(chain in SUPPORTED_CHAINS_MAP)) {
        throw new Error(`chain ${chain} not supported`);
      }
    });

    if (sessionKeyFilePath) {
      if (!fs.existsSync(sessionKeyFilePath)) {
        throw new Error('Session key file does not exist');
      }
    }

    const serializedSessionKeyParams = sessionKeyFilePath
      ? fs.readFileSync(sessionKeyFilePath, 'utf8')
      : undefined;

    await deployContracts(
      ensureHex(bytecode),
      chains,
      ensureHex(salt),
      expectedAddress,
      serializedSessionKeyParams
    );
  });

program
  .command('create-session-key')
  .description('Create a session key authorized to deploy contracts')
  .action(async () => {
    const sessionKey = await generateSessionKey(
      ZERODEV_PROJECT_ID,
      ensureHex(PRIVATE_KEY)
    );
    fs.writeFileSync('session-key.txt', sessionKey);
    console.log('Session key generated and saved to session-key.txt');
  });
