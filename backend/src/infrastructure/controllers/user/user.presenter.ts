import { ApiProperty } from '@nestjs/swagger';
import { UserModel } from '../../../domain/model/user';

export class UserPresenter {
  @ApiProperty()
  id: number;
  @ApiProperty()
  account: string;
  @ApiProperty()
  balance: string;
  @ApiProperty()
  createdAt: Date;
  @ApiProperty()
  updatedAt: Date;

  constructor(user: UserModel) {
    this.id = user.id;
    this.account = user.account;
    this.balance = user.balance.toString();
    this.createdAt = user.createdAt;
    this.updatedAt = user.updatedAt;
  }
}
