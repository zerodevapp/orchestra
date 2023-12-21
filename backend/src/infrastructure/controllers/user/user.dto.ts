import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateBalanceDto {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsString()
  readonly account: string;
  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsString()
  readonly amount: bigint;
}

export class CreateUserDto {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsString()
  readonly account: string;
}
