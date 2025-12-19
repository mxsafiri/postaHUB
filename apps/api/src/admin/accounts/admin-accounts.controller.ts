import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { Roles } from '../../common/auth/roles.decorator';
import { RolesGuard } from '../../common/auth/roles.guard';
import { SessionAuthGuard } from '../../common/auth/session-auth.guard';
import { AdminAccountsService } from './admin-accounts.service';

@Controller('v1/admin/accounts')
@UseGuards(SessionAuthGuard, RolesGuard)
@Roles('platform_admin')
export class AdminAccountsController {
  constructor(private readonly accounts: AdminAccountsService) {}

  @Get()
  async search(@Query('q') q?: string, @Query('limit') limit?: string) {
    const rows = await this.accounts.searchAccounts({
      query: q,
      limit: limit ? Number(limit) : undefined,
    });

    const withRoles = await Promise.all(
      rows.map(async (a) => {
        const roles = await this.accounts.getRoles(a.id);
        return { ...a, roles };
      }),
    );

    return { accounts: withRoles };
  }

  @Get(':accountId')
  async get(@Param('accountId') accountId: string) {
    const account = await this.accounts.getAccount(accountId);
    if (!account) return { account: null };
    const roles = await this.accounts.getRoles(accountId);
    return { account, roles };
  }

  @Post(':accountId/roles/add')
  async addRole(@Param('accountId') accountId: string, @Body() body: { role: string }) {
    await this.accounts.addRole(accountId, body.role);
    const roles = await this.accounts.getRoles(accountId);
    return { ok: true, roles };
  }

  @Post(':accountId/roles/remove')
  async removeRole(@Param('accountId') accountId: string, @Body() body: { role: string }) {
    await this.accounts.removeRole(accountId, body.role);
    const roles = await this.accounts.getRoles(accountId);
    return { ok: true, roles };
  }
}
