#!/usr/bin/env node
import figlet from 'figlet';
import chalk from 'chalk';
import Table from 'cli-table3';
import { Command } from 'commander';
import {
  computeAddress,
  deployContracts,
  findDeployment,
  getDeployerAddress,
} from '../action';
import { DEPLOYER_CONTRACT_ADDRESS, getSupportedChains } from '../constant';
import {
  ensureHex,
  processAndValidateChains,
  readBytecodeFromFile,
} from '../utils';

export const program = new Command();

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
  return `\n\n${asciiArt}\n\n\n${originalHelpInformation}`;
};

program
  .command('chains')
  .description('Show the list of available chains')
  .action(() => {
    const chains = getSupportedChains().map((chain) => [
      chain.name,
      chain.type === 'mainnet'
        ? chalk.blue(chain.type)
        : chalk.green(chain.type),
    ]);

    const table = new Table({
      head: ['Name', 'Type'],
      chars: { mid: '', 'left-mid': '', 'mid-mid': '', 'right-mid': '' },
    });

    chains.forEach((chain) => table.push(chain));

    console.log('[Available chains]');
    console.log(table.toString());
  });

program
  .command('compute-address')
  .description('Compute the address to be deployed')
  .argument('<path-to-bytecode>', 'file path of bytecode to deploy')
  .argument('<salt>', 'salt to be used for create2')
  .action((pathToBytecode: string, salt: string) => {
    const bytecode = readBytecodeFromFile(pathToBytecode);
    const address = computeAddress(
      DEPLOYER_CONTRACT_ADDRESS,
      ensureHex(bytecode),
      ensureHex(salt)
    );
    console.log(`computed address: ${address}`);
  });

program
  .command('get-deployer-address')
  .description("Get the deployer's address")
  .action(async () => {
    const address = await getDeployerAddress();
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
  .option('-t, --testnet-all', 'select all testnets', false)
  .option('-m, --mainnet-all', 'select all mainnets', false)
  .action((pathToBytecode: string, salt: string, options) => {
    const { chains, expectedAddress, testnetAll, mainnetAll } = options;
    const bytecode = readBytecodeFromFile(pathToBytecode);

    const chainObjects = processAndValidateChains(chains, {
      testnetAll,
      mainnetAll,
    });

    deployContracts(
      ensureHex(bytecode),
      chainObjects,
      ensureHex(salt),
      expectedAddress
    );
  });

/** @notice 400 error on base-sepolia */
program
  .command('check-deployment')
  .description(
    'check whether the contract has already been deployed on the specified networks'
  )
  .argument(
    '<path-to-bytecode>',
    'file path of bytecode to deploy, a.k.a. init code'
  )
  .argument('<salt>', 'salt used for depolyment')
  .option(
    '-c, --chains [CHAINS]',
    'list of chains to check, with all selected by default',
    'all'
  )
  .option('-t, --testnet-all', 'select all testnets', false)
  .option('-m, --mainnet-all', 'select all mainnets', false)
  .action(async (pathToBytecode: string, salt: string, options) => {
    const { chains, testnetAll, mainnetAll } = options;
    const bytecode = readBytecodeFromFile(pathToBytecode);

    const chainObjects = processAndValidateChains(chains, {
      testnetAll,
      mainnetAll,
    });

    const { contractAddress, deployedChains, notDeployedChains } =
      await findDeployment(ensureHex(bytecode), ensureHex(salt), chainObjects);

    console.log(`contract address: ${contractAddress}`);
    console.log('deployed on:');
    deployedChains.forEach((chain) => console.log(`- ${chain.name}`));
    console.log('not deployed on:');
    notDeployedChains.forEach((chain) => console.log(`- ${chain.name}`));
  });
