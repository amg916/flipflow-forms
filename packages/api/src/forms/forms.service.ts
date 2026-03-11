import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { FormDefinition, evaluateStep, FormAnswers, StepEvaluation } from '@flipflow/shared';
import { CreateFormDto, UpdateFormDto } from './forms.dto';

@Injectable()
export class FormsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateFormDto) {
    await this.ensureMembership(userId, dto.orgId, ['owner', 'admin', 'editor']);

    const defaultDefinition: Partial<FormDefinition> = {
      title: dto.title,
      description: dto.description,
      steps: [
        {
          id: crypto.randomUUID(),
          title: 'Step 1',
          order: 0,
          questions: [],
        },
      ],
      theme: {
        primaryColor: '#3b82f6',
        backgroundColor: '#ffffff',
        fontFamily: 'Inter, system-ui, sans-serif',
        borderRadius: 8,
        buttonStyle: 'filled',
      },
      settings: {
        showProgressBar: true,
        allowBackNavigation: true,
        submitButtonText: 'Submit',
      },
    };

    return this.prisma.form.create({
      data: {
        orgId: dto.orgId,
        title: dto.title,
        description: dto.description,
        definition: (dto.definition ?? defaultDefinition) as object,
      },
    });
  }

  async findAllByOrg(userId: string, orgId: string) {
    await this.ensureMembership(userId, orgId);
    return this.prisma.form.findMany({
      where: { orgId },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findOne(formId: string) {
    const form = await this.prisma.form.findUnique({ where: { id: formId } });
    if (!form) throw new NotFoundException('Form not found');
    return form;
  }

  async findOneAuthed(userId: string, formId: string) {
    const form = await this.findOne(formId);
    await this.ensureMembership(userId, form.orgId);
    return form;
  }

  async update(userId: string, formId: string, dto: UpdateFormDto) {
    const form = await this.findOne(formId);
    await this.ensureMembership(userId, form.orgId, ['owner', 'admin', 'editor']);

    return this.prisma.form.update({
      where: { id: formId },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.definition !== undefined && { definition: dto.definition as object }),
        ...(dto.published !== undefined && { published: dto.published }),
      },
    });
  }

  async delete(userId: string, formId: string) {
    const form = await this.findOne(formId);
    await this.ensureMembership(userId, form.orgId, ['owner', 'admin']);
    return this.prisma.form.delete({ where: { id: formId } });
  }

  async publish(userId: string, formId: string) {
    const form = await this.findOne(formId);
    await this.ensureMembership(userId, form.orgId, ['owner', 'admin', 'editor']);

    // Generate slug if not set
    const slug = form.slug ?? this.generateSlug(form.title, form.id);

    return this.prisma.form.update({
      where: { id: formId },
      data: {
        published: true,
        slug,
        version: { increment: 1 },
      },
    });
  }

  async unpublish(userId: string, formId: string) {
    const form = await this.findOne(formId);
    await this.ensureMembership(userId, form.orgId, ['owner', 'admin', 'editor']);

    return this.prisma.form.update({
      where: { id: formId },
      data: { published: false },
    });
  }

  /** Find a published form by ID or slug (public — no auth required) */
  async findPublished(idOrSlug: string) {
    const form = await this.prisma.form.findFirst({
      where: {
        published: true,
        OR: [{ id: idOrSlug }, { slug: idOrSlug }],
      },
    });
    if (!form) throw new NotFoundException('Form not found or not published');
    return form;
  }

  /** Get embed code snippet for a form */
  getEmbedCode(formId: string, appUrl: string): string {
    return `<div id="flipflow-${formId}"></div>
<script>
(function(){
  var f=document.getElementById("flipflow-${formId}");
  var i=document.createElement("iframe");
  i.src="${appUrl}/forms/${formId}?embed=1";
  i.style.cssText="width:100%;border:none;overflow:hidden";
  i.setAttribute("scrolling","no");
  f.appendChild(i);
  window.addEventListener("message",function(e){
    if(e.data&&e.data.type==="flipflow:resize"){i.style.height=e.data.height+"px"}
  });
})();
</script>`;
  }

  /** Evaluate conditional logic for a step */
  evaluateFormStep(
    definition: FormDefinition,
    stepId: string,
    answers: FormAnswers,
  ): StepEvaluation {
    return evaluateStep(definition, stepId, answers);
  }

  /** Submit form response */
  async submitForm(
    formId: string,
    data: Record<string, unknown>,
    opts?: {
      metadata?: Record<string, unknown>;
      idempotencyKey?: string;
      variantId?: string;
      ip?: string;
      userAgent?: string;
      consentTimestamp?: string;
    },
  ) {
    // Idempotency check
    if (opts?.idempotencyKey) {
      const existing = await this.prisma.formSubmission.findUnique({
        where: { idempotencyKey: opts.idempotencyKey },
      });
      if (existing) return existing;
    }

    const form = await this.findPublished(formId);
    return this.prisma.formSubmission.create({
      data: {
        formId: form.id,
        data: data as object,
        metadata: (opts?.metadata as object) ?? undefined,
        idempotencyKey: opts?.idempotencyKey,
        variantId: opts?.variantId,
        ip: opts?.ip,
        userAgent: opts?.userAgent,
        consentTimestamp: opts?.consentTimestamp ? new Date(opts.consentTimestamp) : undefined,
        formVersion: form.version,
      },
    });
  }

  /** List submissions for a form (admin) */
  async listSubmissions(
    userId: string,
    formId: string,
    opts?: { page?: number; limit?: number; startDate?: string; endDate?: string },
  ) {
    const form = await this.findOne(formId);
    await this.ensureMembership(userId, form.orgId);

    const page = opts?.page ?? 1;
    const limit = opts?.limit ?? 50;
    const where: Record<string, unknown> = { formId };
    if (opts?.startDate || opts?.endDate) {
      where.createdAt = {
        ...(opts?.startDate && { gte: new Date(opts.startDate) }),
        ...(opts?.endDate && { lte: new Date(opts.endDate) }),
      };
    }

    const [submissions, total] = await Promise.all([
      this.prisma.formSubmission.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.formSubmission.count({ where }),
    ]);

    return { submissions, total, page, limit };
  }

  private generateSlug(title: string, id: string): string {
    const base = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 50);
    return `${base}-${id.slice(0, 8)}`;
  }

  private async ensureMembership(userId: string, orgId: string, allowedRoles?: string[]) {
    const membership = await this.prisma.orgMembership.findUnique({
      where: { userId_orgId: { userId, orgId } },
    });
    if (!membership) throw new ForbiddenException('Not a member of this organization');
    if (allowedRoles && !allowedRoles.includes(membership.role)) {
      throw new ForbiddenException('Insufficient role for this action');
    }
    return membership;
  }
}
