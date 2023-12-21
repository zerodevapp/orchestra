import { program } from './command';
import figlet from 'figlet';
import chalk from 'chalk';

async function main() {
  console.log(
    await chalk.blueBright(
      figlet.textSync('ZeroDev Multichain Deployer', {
        horizontalLayout: 'default',
        verticalLayout: 'default',
        width: 100,
        whitespaceBreak: true,
      })
    )
  );

  program.parse(process.argv);
}

if (require.main === module) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
