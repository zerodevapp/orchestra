import { ILogger } from '../../domain/logger/logger.interface';
import { UserRepository } from '../../domain/repositories/userRepository.interface';

export class updateBalanceUseCases {
  constructor(
    private readonly logger: ILogger,
    private readonly userRepository: UserRepository,
  ) {}

  async execute(account: string, amount: bigint): Promise<bigint> {
    const currentBalance = await this.userRepository.getBalance(account);

    if (amount < 0 && amount * -1n > currentBalance) {
      throw new Error('Insufficient balance');
    }

    const newBalance = currentBalance + amount;
    await this.userRepository.updateBalance(account, newBalance);

    this.logger.log(
      'updateBalanceUseCases execute',
      `Balance have been updated to ${newBalance}`,
    );
    return newBalance;
  }
}
