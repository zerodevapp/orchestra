import fs from 'fs';
import path from 'path';

export const readBytecodeFromFile = (pathToBytecode: string): string => {
  return fs
    .readFileSync(path.resolve(process.cwd(), pathToBytecode), 'utf8')
    .replace(/\n+$/, '');
};

export const writeErrorLogToFile = (chainName: string, error: Error): void => {
  const logDir = path.resolve(process.cwd(), 'log');

  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  fs.writeFileSync(
    path.join(logDir, `${chainName}_error_${timestamp}.log`),
    error.toString()
  );
};
