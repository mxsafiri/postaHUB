import { Injectable } from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { RolesService } from './roles.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly accounts: AccountsService,
    private readonly roles: RolesService,
  ) {}

  async register(params: { phone: string; password: string; displayName?: string; nidaNumber?: string }) {
    const account = await this.accounts.createAccount(params);
    await this.roles.assignRoleByKey(account.id, 'citizen');
    const accountRoles = await this.roles.getRolesForAccount(account.id);

    return {
      account: {
        id: account.id,
        phoneE164: account.phone_e164,
        displayName: account.display_name,
        nidaNumber: (account as any).nida_number ?? null,
        nidaVerificationStatus: (account as any).nida_verification_status ?? 'not_provided',
        status: account.status,
      },
      roles: accountRoles.map((r) => r.key),
    };
  }

  async login(params: { phone: string; password: string }) {
    const account = await this.accounts.verifyPassword(params);
    if (!account) return null;

    const accountRoles = await this.roles.getRolesForAccount(account.id);

    return {
      account: {
        id: account.id,
        phoneE164: account.phone_e164,
        displayName: account.display_name,
        nidaNumber: (account as any).nida_number ?? null,
        nidaVerificationStatus: (account as any).nida_verification_status ?? 'not_provided',
        status: account.status,
      },
      roles: accountRoles.map((r) => r.key),
    };
  }
}
