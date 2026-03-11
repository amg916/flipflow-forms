import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { EmailService } from '../auth/email.service';
import { CreateOrgDto, UpdateOrgDto, InviteMemberDto } from './orgs.dto';
import { OrgRole } from '@prisma/client';
import * as crypto from 'crypto';

@Injectable()
export class OrgsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  private generateSlug(name: string): string {
    const base = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 50);
    const randomChars = crypto.randomBytes(3).toString('hex'); // 6 hex chars
    return `${base}-${randomChars}`;
  }

  async create(userId: string, dto: CreateOrgDto) {
    const slug = this.generateSlug(dto.name);

    return this.prisma.$transaction(async (tx) => {
      const org = await tx.org.create({
        data: {
          name: dto.name,
          slug,
        },
      });

      await tx.orgMembership.create({
        data: {
          userId,
          orgId: org.id,
          role: OrgRole.owner,
        },
      });

      return org;
    });
  }

  async findByUser(userId: string) {
    const memberships = await this.prisma.orgMembership.findMany({
      where: { userId },
      include: { org: true },
    });
    return memberships.map((m) => ({ ...m.org, role: m.role }));
  }

  async findOne(orgId: string) {
    const org = await this.prisma.org.findUnique({ where: { id: orgId } });
    if (!org) {
      throw new NotFoundException('Org not found');
    }
    return org;
  }

  async update(userId: string, orgId: string, dto: UpdateOrgDto) {
    await this.requireRole(userId, orgId, [OrgRole.owner, OrgRole.admin]);

    return this.prisma.org.update({
      where: { id: orgId },
      data: { ...dto },
    });
  }

  async delete(userId: string, orgId: string) {
    await this.requireRole(userId, orgId, [OrgRole.owner]);

    await this.prisma.org.delete({ where: { id: orgId } });
  }

  async listMembers(userId: string, orgId: string) {
    await this.requireMembership(userId, orgId);

    return this.prisma.orgMembership.findMany({
      where: { orgId },
      include: {
        user: {
          select: { id: true, email: true, name: true },
        },
      },
    });
  }

  async inviteMember(userId: string, orgId: string, dto: InviteMemberDto) {
    await this.requireRole(userId, orgId, [OrgRole.owner, OrgRole.admin]);

    const org = await this.findOne(orgId);
    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const invite = await this.prisma.orgInvite.create({
      data: {
        orgId,
        email: dto.email,
        role: (dto.role as OrgRole) || OrgRole.editor,
        token,
        expiresAt,
      },
    });

    await this.emailService.sendEmail(
      dto.email,
      `You've been invited to ${org.name}`,
      `<h2>Org Invite</h2>
       <p>You've been invited to join <strong>${org.name}</strong> as ${dto.role || 'editor'}.</p>
       <p>Use this token to accept: <code>${token}</code></p>
       <p>This invite expires in 7 days.</p>`,
    );

    return invite;
  }

  async acceptInvite(userId: string, token: string) {
    const invite = await this.prisma.orgInvite.findUnique({ where: { token } });

    if (!invite) {
      throw new NotFoundException('Invite not found');
    }

    if (invite.expiresAt < new Date()) {
      await this.prisma.orgInvite.delete({ where: { id: invite.id } });
      throw new BadRequestException('Invite has expired');
    }

    // Check if already a member
    const existing = await this.prisma.orgMembership.findUnique({
      where: { userId_orgId: { userId, orgId: invite.orgId } },
    });

    if (existing) {
      await this.prisma.orgInvite.delete({ where: { id: invite.id } });
      throw new BadRequestException('Already a member of this org');
    }

    const membership = await this.prisma.$transaction(async (tx) => {
      const m = await tx.orgMembership.create({
        data: {
          userId,
          orgId: invite.orgId,
          role: invite.role,
        },
      });
      await tx.orgInvite.delete({ where: { id: invite.id } });
      return m;
    });

    return membership;
  }

  async removeMember(userId: string, orgId: string, targetUserId: string) {
    const callerMembership = await this.requireRole(userId, orgId, [OrgRole.owner, OrgRole.admin]);

    if (userId === targetUserId && callerMembership.role === OrgRole.owner) {
      throw new ForbiddenException('Owner cannot remove themselves');
    }

    const targetMembership = await this.prisma.orgMembership.findUnique({
      where: { userId_orgId: { userId: targetUserId, orgId } },
    });

    if (!targetMembership) {
      throw new NotFoundException('Member not found');
    }

    // Admins cannot remove owners
    if (callerMembership.role === OrgRole.admin && targetMembership.role === OrgRole.owner) {
      throw new ForbiddenException('Admins cannot remove owners');
    }

    await this.prisma.orgMembership.delete({
      where: { userId_orgId: { userId: targetUserId, orgId } },
    });
  }

  private async requireMembership(userId: string, orgId: string) {
    const membership = await this.prisma.orgMembership.findUnique({
      where: { userId_orgId: { userId, orgId } },
    });

    if (!membership) {
      throw new ForbiddenException('Not a member of this org');
    }

    return membership;
  }

  private async requireRole(userId: string, orgId: string, roles: OrgRole[]) {
    const membership = await this.requireMembership(userId, orgId);

    if (!roles.includes(membership.role)) {
      throw new ForbiddenException(`Requires ${roles.join(' or ')} role`);
    }

    return membership;
  }
}
