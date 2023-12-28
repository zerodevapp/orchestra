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
  getDeployerAddress,
} from '../action';
import { PRIVATE_KEY, ZERODEV_PROJECT_ID } from '../config';
import { DEPLOYER_CONTRACT_ADDRESS, SUPPORTED_CHAINS_MAP } from '../constant';
import { ensureHex, validateInputs } from '../utils';
import { findDeployment } from '../action/findDeployment';

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

// TODO: show the help info from above not below
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
    const address = computeAddress(DEPLOYER_CONTRACT_ADDRESS, bytecode, salt);
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
  .command('deploy')
  .description(
    'Deploy contracts deterministically using CREATE2, in order of the chains specified'
  )
  .argument(
    '<path-to-bytecode>',
    'file path of bytecode to deploy, a.k.a. init code'
  )
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
  .action((pathToBytecode: string, salt: string, options) => {
    let { chains, expectedAddress, sessionKeyFilePath } = options;
    const bytecode = fs
      .readFileSync(path.resolve(process.cwd(), pathToBytecode), 'utf8')
      .replace(/\n+$/, '');

    chains =
      chains === 'all' ? Object.keys(SUPPORTED_CHAINS_MAP) : chains.split(',');

    validateInputs(bytecode, salt, expectedAddress, chains, sessionKeyFilePath);

    const serializedSessionKeyParams = sessionKeyFilePath
      ? fs.readFileSync(sessionKeyFilePath, 'utf8')
      : undefined;

    deployContracts(
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

program
  .command('check-deployment')
  .description(
    'check whether the contract has already been deployed on the specified networks'
  )
  .argument(
    '<path-to-bytecode>',
    'file path of the deployed bytecode, not init code'
  )
  .argument('<salt>', 'salt used for depolyment')
  .option(
    '-c, --chains [CHAINS]',
    'list of chains to check, with all selected by default',
    'all'
  )
  .action(async (pathToBytecode: string, salt: string, options) => {
    let { chains } = options;
    const bytecode = fs
      .readFileSync(path.resolve(process.cwd(), pathToBytecode), 'utf8')
      .replace(/\n+$/, '');

    chains =
      chains === 'all' ? Object.keys(SUPPORTED_CHAINS_MAP) : chains.split(',');

    validateInputs(bytecode, salt, undefined, chains, undefined);

    const { contractAddress, deployedChains, notDeployedChains } =
      await findDeployment(ensureHex(bytecode), ensureHex(salt), chains);

    console.log(`contract address: ${contractAddress}`);
    console.log(`deployed chains: ${deployedChains.join(', ')}`);
    console.log(`not deployed chains: ${notDeployedChains.join(', ')}`);
  });

program
  .command('sync-deployment')
  .description(
    'check if the specified contract is deployed via deterministic-deployment-proxy. if it is, extract bytecode from it and deploy to other networks'
  );
