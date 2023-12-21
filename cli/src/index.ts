import { program } from './command';

async function main() {
  program.parse();
}

if (require.main === module) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
