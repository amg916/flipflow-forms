import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateTemplateDto } from './templates.dto';

@Injectable()
export class TemplatesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(vertical?: string) {
    return this.prisma.template.findMany({
      where: vertical ? { vertical } : undefined,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const template = await this.prisma.template.findUnique({ where: { id } });
    if (!template) throw new NotFoundException('Template not found');
    return template;
  }

  async create(dto: CreateTemplateDto) {
    return this.prisma.template.create({
      data: {
        title: dto.title,
        description: dto.description,
        vertical: dto.vertical,
        definition: dto.definition as object,
        ...(dto.thankYouPage && { thankYouPage: dto.thankYouPage as object }),
      },
    });
  }

  async useTemplate(userId: string, templateId: string, orgId: string) {
    const template = await this.findOne(templateId);

    // Verify user is a member of the org
    const membership = await this.prisma.orgMembership.findUnique({
      where: { userId_orgId: { userId, orgId } },
    });
    if (!membership) {
      throw new NotFoundException('Organization not found');
    }

    return this.prisma.form.create({
      data: {
        orgId,
        title: template.title,
        description: template.description ?? '',
        definition: template.definition as object,
      },
    });
  }
}
