import { fetchUserData } from '../api';

export const getBalance = async (account: string) => {
  const userData = await fetchUserData(account);
  return userData.balance;
};
