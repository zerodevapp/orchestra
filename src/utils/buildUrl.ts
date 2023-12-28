import { PIMLICO_API_KEY, RPC_PROVIDER_API_KEY } from '../config';

const PIMLICO_BASE_URL = 'api.pimlico.io';

export const buildUrlForInfura = (chain: string) =>
  `https://${chain}.infura.io/v3/${RPC_PROVIDER_API_KEY}`;

export const buildUrlForPimlico = (chain: string, version: string) =>
  `https://${PIMLICO_BASE_URL}/${version}/${chain}/rpc?apikey=${PIMLICO_API_KEY}`;
