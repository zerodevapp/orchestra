import {
  Body,
  Controller,
  Get,
  Inject,
  NotFoundException,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiExtraModels,
  ApiResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { UseCaseProxy } from '../../usecases-proxy/usecases-proxy';
import { UsecasesProxyModule } from '../../usecases-proxy/usecases-proxy.module';
import { UserPresenter } from './user.presenter';
import { ApiResponseType } from '../../common/swagger/response.decorator';
import { CreateUserDto, UpdateBalanceDto } from './user.dto';
import { getUserUseCases } from '../../../usecases/user/getUser.usecases';
import { createUserUseCases } from '../../../usecases/user/createUser.usecases';
import { updateBalanceUseCases } from '../../../usecases/user/updateBalance.usecases';
import { AdminApiKeyGuard } from '../guard/auth.guard';

@Controller('user')
@ApiTags('user')
@ApiResponse({ status: 500, description: 'Internal error' })
@ApiExtraModels(UserPresenter)
export class UserController {
  constructor(
    @Inject(UsecasesProxyModule.GET_USER_USECASES_PROXY)
    private readonly getUserUsecaseProxy: UseCaseProxy<getUserUseCases>,
    @Inject(UsecasesProxyModule.CREATE_USER_USECASES_PROXY)
    private readonly createUserUsecaseProxy: UseCaseProxy<createUserUseCases>,
    @Inject(UsecasesProxyModule.UPDATE_BALANCE_USECASES_PROXY)
    private readonly updateBalanceUsecaseProxy: UseCaseProxy<updateBalanceUseCases>,
  ) {}

  @Get('/')
  @ApiResponseType(UserPresenter, false)
  async getUser(@Query('account') account: string) {
    const user = await this.getUserUsecaseProxy.getInstance().execute(account);
    if (!user) {
      throw new NotFoundException('Account not found');
    }
    return new UserPresenter(user);
  }

  @Post('/')
  @ApiResponseType(UserPresenter, false)
  async addUser(@Body() createUserDto: CreateUserDto) {
    const { account } = createUserDto;
    const userCreated = await this.createUserUsecaseProxy
      .getInstance()
      .execute(account);
    return new UserPresenter(userCreated);
  }

  @Put('admin/update-balance')
  @UseGuards(AdminApiKeyGuard)
  @ApiSecurity('AdminApiKey')
  @ApiResponseType(UserPresenter, false)
  async updateBalance(@Body() updateBalanceDto: UpdateBalanceDto) {
    const { account, amount } = updateBalanceDto;
    await this.updateBalanceUsecaseProxy.getInstance().execute(account, amount);
    return 'success';
  }
}
