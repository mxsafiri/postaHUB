import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import type { Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthGuard } from '../common/auth/auth.guard';
import { CurrentAccount } from '../common/auth/current-account.decorator';
import { AccountsService } from './accounts.service';
import { RolesService } from './roles.service';

@Controller('v1/auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly accounts: AccountsService,
    private readonly roles: RolesService,
  ) {}

  @Post('register')
  async register(@Body() dto: RegisterDto, @Req() req: Request) {
    const result = await this.auth.register({
      phone: dto.phone,
      password: dto.password,
      displayName: dto.displayName,
      nidaNumber: dto.nidaNumber,
    });
    req.session.accountId = result.account.id;
    return result;
  }

  @Post('login')
  async login(@Body() dto: LoginDto, @Req() req: Request) {
    const result = await this.auth.login({ phone: dto.phone, password: dto.password });
    if (!result) {
      return { error: 'invalid_credentials' };
    }
    req.session.accountId = result.account.id;
    return result;
  }

  @Post('logout')
  async logout(@Req() req: Request) {
    await new Promise<void>((resolve, reject) => {
      req.session.destroy((err) => {
        if (err) return reject(err);
        resolve();
      });
    });
    return { ok: true };
  }

  @Get('me')
  @AuthGuard()
  async me(@CurrentAccount() accountId: string) {
    const account = await this.accounts.getAccountById(accountId);
    if (!account) return { account: null };
    const roles = await this.roles.getRolesForAccount(account.id);

    return {
      account: {
        id: account.id,
        phoneE164: account.phone_e164,
        displayName: account.display_name,
        nidaNumber: (account as any).nida_number ?? null,
        status: account.status,
      },
      roles: roles.map((r) => r.key),
    };
  }
}
