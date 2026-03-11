import { Controller, Post, Get, Delete, Body, Query, Param, UseGuards } from '@nestjs/common';
import { DomainsService } from './domains.service';
import { RequestDomainDto } from './domains.dto';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('domains')
export class DomainsController {
  constructor(private readonly domainsService: DomainsService) {}

  @Post('request')
  @UseGuards(AuthGuard)
  async requestDomain(@CurrentUser() user: any, @Body() dto: RequestDomainDto) {
    const data = await this.domainsService.requestDomain(user.id, dto);
    return { success: true, data };
  }

  @Get('status')
  @UseGuards(AuthGuard)
  async getDomainStatus(@Query('orgId') orgId: string) {
    const data = await this.domainsService.getDomainStatus(orgId);
    return { success: true, data };
  }

  @Post('verify')
  @UseGuards(AuthGuard)
  async verifyDomain(@Body('orgId') orgId: string) {
    const data = await this.domainsService.verifyDomain(orgId);
    return { success: true, data };
  }

  @Delete()
  @UseGuards(AuthGuard)
  async removeDomain(@CurrentUser() user: any, @Query('orgId') orgId: string) {
    const data = await this.domainsService.removeDomain(user.id, orgId);
    return { success: true, data };
  }

  @Get('resolve/:domain')
  async resolveOrgByDomain(@Param('domain') domain: string) {
    const data = await this.domainsService.resolveOrgByDomain(domain);
    return { success: true, data };
  }
}
