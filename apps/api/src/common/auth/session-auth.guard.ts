import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class SessionAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const accountId = req?.session?.accountId;
    if (!accountId) {
      throw new UnauthorizedException('authentication_required');
    }
    return true;
  }
}
