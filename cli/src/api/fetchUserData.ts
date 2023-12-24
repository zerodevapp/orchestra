import axios from 'axios';
import axiosRetry from 'axios-retry';

const BASE_URL = 'http://localhost:3000/v1';

axiosRetry(axios, { retries: 3, retryDelay: axiosRetry.exponentialDelay });

// TODO: modify after new zerodev backend api is ready
export const fetchUserData = async (account: string) => {
  try {
    const response = await axios.get(`${BASE_URL}/user/`, {
      params: {
        account,
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch user: ${error}`);
    return null;
  }
};
