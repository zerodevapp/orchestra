import { UserModel } from '../model/user';

export interface UserRepository {
  insert(account: string): Promise<UserModel>;
  getBalance(account: string): Promise<bigint>;
  updateBalance(account: string, balance: bigint): Promise<void>;
  findByAccount(account: string): Promise<UserModel>;
}
