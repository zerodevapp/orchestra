import fs from 'fs';
import path from 'path';

export const readBytecodeFromFile = (pathToBytecode: string): string => {
  return fs
    .readFileSync(path.resolve(process.cwd(), pathToBytecode), 'utf8')
    .replace(/\n+$/, '');
};
