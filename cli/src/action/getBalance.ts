import { getUser } from '../api';

export const getBalance = async (account: string) => {
  const userData = await getUser(account);
  return userData.balance;
};
