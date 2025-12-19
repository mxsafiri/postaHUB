import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { RolesService } from '../auth/roles.service';
import { RolesGuard } from '../common/auth/roles.guard';
import { AdminPartnersController } from './partners/admin-partners.controller';
import { AdminPartnersService } from './partners/admin-partners.service';
import { AdminOverviewController } from './overview/admin-overview.controller';
import { AdminOverviewService } from './overview/admin-overview.service';
import { AdminAccountsController } from './accounts/admin-accounts.controller';
import { AdminAccountsService } from './accounts/admin-accounts.service';

@Module({
  imports: [DatabaseModule],
  controllers: [AdminPartnersController, AdminOverviewController, AdminAccountsController],
  providers: [AdminPartnersService, AdminOverviewService, AdminAccountsService, RolesService, RolesGuard],
})
export class AdminModule {}
