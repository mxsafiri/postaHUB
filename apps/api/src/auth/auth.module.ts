import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AccountsService } from './accounts.service';
import { RolesService } from './roles.service';

@Module({
  controllers: [AuthController],
  providers: [AuthService, AccountsService, RolesService],
})
export class AuthModule {}
