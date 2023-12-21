import { DynamicModule, Module } from '@nestjs/common';

import { ExceptionsModule } from '../exceptions/exceptions.module';
import { LoggerModule } from '../logger/logger.module';
import { LoggerService } from '../logger/logger.service';

import { RepositoriesModule } from '../repositories/repositories.module';
import { DatabaseUserRepository } from '../repositories/user.repository';

import { EnvironmentConfigModule } from '../config/environment-config/environment-config.module';

import { UseCaseProxy } from './usecases-proxy';
import { createUserUseCases } from '../../usecases/user/createUser.usecases';
import { getUserUseCases } from '../../usecases/user/getUser.usecases';
import { updateBalanceUseCases } from '../../usecases/user/updateBalance.usecases';

@Module({
  imports: [
    LoggerModule,
    EnvironmentConfigModule,
    RepositoriesModule,
    ExceptionsModule,
  ],
})
export class UsecasesProxyModule {
  static CREATE_USER_USECASES_PROXY = 'createUserUsecasesProxy';
  static GET_USER_USECASES_PROXY = 'getUserUsecasesProxy';
  static UPDATE_BALANCE_USECASES_PROXY = 'updateBalanceUsecasesProxy';

  static register(): DynamicModule {
    return {
      module: UsecasesProxyModule,
      providers: [
        {
          inject: [LoggerService, DatabaseUserRepository],
          provide: UsecasesProxyModule.CREATE_USER_USECASES_PROXY,
          useFactory: (
            logger: LoggerService,
            userRepository: DatabaseUserRepository,
          ) => new UseCaseProxy(new createUserUseCases(logger, userRepository)),
        },
        {
          inject: [DatabaseUserRepository],
          provide: UsecasesProxyModule.GET_USER_USECASES_PROXY,
          useFactory: (userRepository: DatabaseUserRepository) =>
            new UseCaseProxy(new getUserUseCases(userRepository)),
        },
        {
          inject: [LoggerService, DatabaseUserRepository],
          provide: UsecasesProxyModule.UPDATE_BALANCE_USECASES_PROXY,
          useFactory: (
            logger: LoggerService,
            userRepository: DatabaseUserRepository,
          ) =>
            new UseCaseProxy(new updateBalanceUseCases(logger, userRepository)),
        },
      ],
      exports: [
        UsecasesProxyModule.CREATE_USER_USECASES_PROXY,
        UsecasesProxyModule.GET_USER_USECASES_PROXY,
        UsecasesProxyModule.UPDATE_BALANCE_USECASES_PROXY,
      ],
    };
  }
}
