import { applyDecorators, UseGuards } from '@nestjs/common';
import { SessionAuthGuard } from './session-auth.guard';

export function AuthGuard() {
  return applyDecorators(UseGuards(SessionAuthGuard));
}
