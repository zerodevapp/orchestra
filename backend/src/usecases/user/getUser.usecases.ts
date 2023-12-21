import { UserModel } from '../../domain/model/user';
import { UserRepository } from '../../domain/repositories/userRepository.interface';

export class getUserUseCases {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(account: string): Promise<UserModel> {
    const result = await this.userRepository.findByAccount(account);
    return result;
  }
}
