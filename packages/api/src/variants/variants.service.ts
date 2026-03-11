import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { FormsService } from '../forms/forms.service';
import { CreateVariantDto, UpdateVariantDto } from './variants.dto';

@Injectable()
export class VariantsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly formsService: FormsService,
  ) {}

  async create(userId: string, dto: CreateVariantDto) {
    const form = await this.formsService.findOne(dto.formId);
    await this.ensureMembership(userId, form.orgId, ['owner', 'admin', 'editor']);

    const definition = dto.definition ?? (form.definition as object);

    return this.prisma.formVariant.create({
      data: {
        formId: dto.formId,
        name: dto.name,
        definition: definition as object,
      },
    });
  }

  async findByForm(formId: string) {
    return this.prisma.formVariant.findMany({
      where: { formId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(userId: string, variantId: string, dto: UpdateVariantDto) {
    const variant = await this.findVariantOrThrow(variantId);
    const form = await this.formsService.findOne(variant.formId);
    await this.ensureMembership(userId, form.orgId, ['owner', 'admin', 'editor']);

    return this.prisma.formVariant.update({
      where: { id: variantId },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.definition !== undefined && { definition: dto.definition as object }),
        ...(dto.weight !== undefined && { weight: dto.weight }),
        ...(dto.active !== undefined && { active: dto.active }),
      },
    });
  }

  async delete(userId: string, variantId: string) {
    const variant = await this.findVariantOrThrow(variantId);
    const form = await this.formsService.findOne(variant.formId);
    await this.ensureMembership(userId, form.orgId, ['owner', 'admin']);

    return this.prisma.formVariant.delete({ where: { id: variantId } });
  }

  async assignVariant(formId: string) {
    const variants = await this.prisma.formVariant.findMany({
      where: { formId, active: true },
    });

    if (variants.length === 0) {
      // No variants configured — fall back to the form's own definition
      const form = await this.formsService.findOne(formId);
      return { variantId: null, definition: form.definition };
    }

    const totalWeight = variants.reduce((sum, v) => sum + v.weight, 0);
    let random = Math.random() * totalWeight;

    for (const variant of variants) {
      random -= variant.weight;
      if (random <= 0) {
        return { variantId: variant.id, definition: variant.definition };
      }
    }

    // Fallback to last variant (should not normally reach here)
    const last = variants[variants.length - 1];
    return { variantId: last.id, definition: last.definition };
  }

  private async findVariantOrThrow(variantId: string) {
    const variant = await this.prisma.formVariant.findUnique({
      where: { id: variantId },
    });
    if (!variant) throw new NotFoundException('Variant not found');
    return variant;
  }

  private async ensureMembership(userId: string, orgId: string, allowedRoles?: string[]) {
    const membership = await this.prisma.orgMembership.findUnique({
      where: { userId_orgId: { userId, orgId } },
    });
    if (!membership) {
      throw new NotFoundException('Not a member of this organization');
    }
    if (allowedRoles && !allowedRoles.includes(membership.role)) {
      throw new NotFoundException('Insufficient role for this action');
    }
    return membership;
  }
}
