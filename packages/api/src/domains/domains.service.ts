import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { RequestDomainDto } from './domains.dto';

@Injectable()
export class DomainsService {
  constructor(private readonly prisma: PrismaService) {}

  async requestDomain(userId: string, dto: RequestDomainDto) {
    const membership = await this.prisma.orgMembership.findUnique({
      where: { userId_orgId: { userId, orgId: dto.orgId } },
    });

    if (!membership || !['owner', 'admin'].includes(membership.role)) {
      throw new ForbiddenException('Only org owners or admins can request a custom domain');
    }

    const org = await this.prisma.org.findUnique({ where: { id: dto.orgId } });
    if (!org) {
      throw new NotFoundException('Organization not found');
    }

    if (org.plan !== 'enterprise') {
      throw new ForbiddenException('Custom domains require an enterprise plan');
    }

    const existing = await this.prisma.org.findUnique({
      where: { customDomain: dto.domain },
    });
    if (existing && existing.id !== dto.orgId) {
      throw new ConflictException('Domain is already in use by another organization');
    }

    const updated = await this.prisma.org.update({
      where: { id: dto.orgId },
      data: { customDomain: dto.domain, domainVerified: false },
    });

    return {
      orgId: updated.id,
      domain: updated.customDomain,
      verified: updated.domainVerified,
    };
  }

  async getDomainStatus(orgId: string) {
    const org = await this.prisma.org.findUnique({ where: { id: orgId } });
    if (!org) {
      throw new NotFoundException('Organization not found');
    }

    return {
      domain: org.customDomain,
      verified: org.domainVerified,
      dnsInstructions: org.customDomain
        ? `Create a CNAME record pointing ${org.customDomain} to forms.flipflow.io`
        : null,
    };
  }

  async verifyDomain(orgId: string) {
    const org = await this.prisma.org.findUnique({ where: { id: orgId } });
    if (!org) {
      throw new NotFoundException('Organization not found');
    }

    if (!org.customDomain) {
      return { verified: false, message: 'No custom domain configured' };
    }

    // Stub: in production, perform actual DNS lookup to verify CNAME propagation
    await this.prisma.org.update({
      where: { id: orgId },
      data: { domainVerified: true },
    });

    return { verified: true, message: 'Domain verified successfully' };
  }

  async removeDomain(userId: string, orgId: string) {
    const membership = await this.prisma.orgMembership.findUnique({
      where: { userId_orgId: { userId, orgId } },
    });

    if (!membership || !['owner', 'admin'].includes(membership.role)) {
      throw new ForbiddenException('Only org owners or admins can remove a custom domain');
    }

    const updated = await this.prisma.org.update({
      where: { id: orgId },
      data: { customDomain: null, domainVerified: false },
    });

    return {
      orgId: updated.id,
      domain: updated.customDomain,
      verified: updated.domainVerified,
    };
  }

  async resolveOrgByDomain(domain: string) {
    const org = await this.prisma.org.findUnique({
      where: { customDomain: domain },
    });

    if (!org || !org.domainVerified) {
      throw new NotFoundException('No verified organization found for this domain');
    }

    return {
      orgId: org.id,
      name: org.name,
      slug: org.slug,
      domain: org.customDomain,
    };
  }
}
