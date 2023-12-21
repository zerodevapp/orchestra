import { ILogger } from '../../domain/logger/logger.interface';
import { UserModel } from '../../domain/model/user';
import { UserRepository } from '../../domain/repositories/userRepository.interface';

export class createUserUseCases {
  constructor(
    private readonly logger: ILogger,
    private readonly userRepository: UserRepository,
  ) {}

  async execute(account: string): Promise<UserModel> {
    const user = await this.userRepository.findByAccount(account);
    // TODO: return 400 error code, not 500
    if (user) {
      throw new Error('User already exists');
    }

    const result = await this.userRepository.insert(account);
    this.logger.log(
      'createUserUseCases execute',
      'New user have been inserted',
    );
    return result;
  }
}
