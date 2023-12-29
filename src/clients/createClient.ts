import { http } from 'viem';
import { ZERODEV_URL } from '../constant';

export const createZeroDevClient = (mode: string, projectId: string) =>
  http(`${ZERODEV_URL}/${mode}/${projectId}`);
