import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserModel } from '../../domain/model/user';
import { UserRepository } from '../../domain/repositories/userRepository.interface';
import { User } from '../entities/user.entity';

@Injectable()
export class DatabaseUserRepository implements UserRepository {
  constructor(
    @InjectRepository(User)
    private readonly userEntityRepository: Repository<User>,
  ) {}

  async insert(account: string): Promise<UserModel> {
    const entity = await this.userEntityRepository.save({
      account,
      balance: BigInt(0),
    });
    return this.toUser(entity);
  }

  async getBalance(account: string): Promise<bigint> {
    const userEntity = await this.userEntityRepository.findOne({
      where: { account: account },
    });
    return userEntity.balance;
  }

  async updateBalance(account: string, balance: bigint): Promise<void> {
    await this.userEntityRepository.update(
      {
        account: account,
      },
      { balance: balance },
    );
  }

  async findByAccount(account: string): Promise<UserModel> {
    const userEntity = await this.userEntityRepository.findOne({
      where: { account: account },
    });
    if (!userEntity) {
      return null;
    }
    return this.toUser(userEntity);
  }

  private toUser(userEntity: User): UserModel {
    return {
      id: userEntity.id,
      account: userEntity.account,
      balance: userEntity.balance,
      createdAt: userEntity.createdAt,
      updatedAt: userEntity.updatedAt,
    };
  }

  private toUserEntity(user: UserModel): User {
    return {
      id: user.id,
      account: user.account,
      balance: user.balance,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
