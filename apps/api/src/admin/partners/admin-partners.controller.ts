import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { Roles } from '../../common/auth/roles.decorator';
import { RolesGuard } from '../../common/auth/roles.guard';
import { SessionAuthGuard } from '../../common/auth/session-auth.guard';
import { AdminPartnersService } from './admin-partners.service';

@Controller('v1/admin/partners')
@UseGuards(SessionAuthGuard, RolesGuard)
@Roles('platform_admin')
export class AdminPartnersController {
  constructor(private readonly partners: AdminPartnersService) {}

  @Post()
  async createPartner(@Body() body: { name: string }) {
    return this.partners.createPartner({ name: body.name });
  }

  @Get()
  async listPartners() {
    const partners = await this.partners.listPartners();
    return { partners };
  }

  @Get(':partnerId/api-keys')
  async listKeys(@Param('partnerId') partnerId: string) {
    const keys = await this.partners.listPartnerKeys(partnerId);
    return { keys };
  }

  @Post(':partnerId/api-keys')
  async createKey(@Param('partnerId') partnerId: string) {
    return this.partners.createPartnerKey(partnerId);
  }

  @Post('api-keys/:keyId/revoke')
  async revokeKey(@Param('keyId') keyId: string) {
    return this.partners.revokeKey(keyId);
  }
}
