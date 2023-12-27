import { program } from './command';

async function main() {
  program.parse(process.argv);
}

if (require.main === module) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
