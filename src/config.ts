import dotenv from 'dotenv';

dotenv.config();

function getEnvVar(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Required environment variable ${name} is missing`);
  }
  return value;
}

export const ZERODEV_PROJECT_ID = getEnvVar('ZERODEV_PROJECT_ID');
export const PRIVATE_KEY = getEnvVar('PRIVATE_KEY');
export const RPC_PROVIDER_API_KEY = getEnvVar('RPC_PROVIDER_API_KEY');

// TODO: -c --chains option specifed chain rpc url is required
