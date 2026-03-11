import { Controller, Post, Get, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { OrgsService } from './orgs.service';
import { CreateOrgDto, UpdateOrgDto, InviteMemberDto, AcceptInviteDto } from './orgs.dto';

interface AuthUser {
  id: string;
  email: string;
  name: string;
}

@Controller('orgs')
@UseGuards(AuthGuard)
export class OrgsController {
  constructor(private readonly orgsService: OrgsService) {}

  @Post()
  async create(@CurrentUser() user: AuthUser, @Body() dto: CreateOrgDto) {
    const data = await this.orgsService.create(user.id, dto);
    return { success: true, data };
  }

  @Get()
  async findAll(@CurrentUser() user: AuthUser) {
    const data = await this.orgsService.findByUser(user.id);
    return { success: true, data };
  }

  @Get(':id')
  async findOne(@CurrentUser() _user: AuthUser, @Param('id') id: string) {
    const data = await this.orgsService.findOne(id);
    return { success: true, data };
  }

  @Put(':id')
  async update(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: UpdateOrgDto) {
    const data = await this.orgsService.update(user.id, id, dto);
    return { success: true, data };
  }

  @Delete(':id')
  async delete(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    await this.orgsService.delete(user.id, id);
    return { success: true, data: null };
  }

  @Get(':id/members')
  async listMembers(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    const data = await this.orgsService.listMembers(user.id, id);
    return { success: true, data };
  }

  @Post(':id/invite')
  async inviteMember(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: InviteMemberDto,
  ) {
    const data = await this.orgsService.inviteMember(user.id, id, dto);
    return { success: true, data };
  }

  @Post('accept-invite')
  async acceptInvite(@CurrentUser() user: AuthUser, @Body() dto: AcceptInviteDto) {
    const data = await this.orgsService.acceptInvite(user.id, dto.token);
    return { success: true, data };
  }

  @Delete(':id/members/:userId')
  async removeMember(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Param('userId') targetUserId: string,
  ) {
    await this.orgsService.removeMember(user.id, id, targetUserId);
    return { success: true, data: null };
  }
}
