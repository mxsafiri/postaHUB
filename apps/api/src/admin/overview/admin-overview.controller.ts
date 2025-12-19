import { Controller, Get, UseGuards } from '@nestjs/common';
import { Roles } from '../../common/auth/roles.decorator';
import { RolesGuard } from '../../common/auth/roles.guard';
import { SessionAuthGuard } from '../../common/auth/session-auth.guard';
import { AdminOverviewService } from './admin-overview.service';

@Controller('v1/admin/overview')
@UseGuards(SessionAuthGuard, RolesGuard)
@Roles('platform_admin')
export class AdminOverviewController {
  constructor(private readonly overview: AdminOverviewService) {}

  @Get()
  async getOverview() {
    return this.overview.getOverview();
  }
}
