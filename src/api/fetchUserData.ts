import axios from 'axios';
import axiosRetry from 'axios-retry';

axiosRetry(axios, { retries: 3, retryDelay: axiosRetry.exponentialDelay });

// TODO: modify after new zerodev backend api is ready
export const fetchUserData = async (account: string) => {
  return 500;
};
