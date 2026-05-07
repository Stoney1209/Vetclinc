import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UserCommonService } from '../common/services/user-common.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService, UserCommonService],
  exports: [UsersService, UserCommonService],
})
export class UsersModule {}
