import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';
import { RolesService } from '../../auth/roles.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly roles: RolesService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const required = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [context.getHandler(), context.getClass()]);
    if (!required || required.length === 0) return true;

    const req = context.switchToHttp().getRequest();
    const accountId = req?.session?.accountId;
    if (!accountId) {
      throw new ForbiddenException('forbidden');
    }

    const accountRoles = await this.roles.getRolesForAccount(accountId);
    const keys = new Set(accountRoles.map((r) => r.key));

    const ok = required.some((r) => keys.has(r));
    if (!ok) throw new ForbiddenException('forbidden');
    return true;
  }
}
