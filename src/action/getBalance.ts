import { fetchUserData } from '../api';

export const getBalance = async (account: string) => {
  const balance = await fetchUserData(account);
  return balance;
};
