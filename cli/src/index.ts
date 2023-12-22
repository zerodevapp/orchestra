import { program } from './command';
import figlet from 'figlet';
import chalk from 'chalk';

async function main() {
  program.parse(process.argv);
}

if (require.main === module) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
