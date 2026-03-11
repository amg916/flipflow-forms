import { Injectable, ForbiddenException, NotFoundException, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma.service';
import { CreateWebhookDto, UpdateWebhookDto } from './webhooks.dto';

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name);

  constructor(private readonly prisma: PrismaService) {}

  private async ensureMembership(userId: string, orgId: string) {
    const membership = await this.prisma.orgMembership.findUnique({
      where: { userId_orgId: { userId, orgId } },
    });
    if (!membership) {
      throw new ForbiddenException('You are not a member of this organization');
    }
    return membership;
  }

  async create(userId: string, dto: CreateWebhookDto) {
    await this.ensureMembership(userId, dto.orgId);

    return this.prisma.webhookDestination.create({
      data: {
        orgId: dto.orgId,
        formId: dto.formId,
        name: dto.name,
        url: dto.url,
        method: dto.method ?? 'POST',
        headers: (dto.headers as Prisma.InputJsonValue) ?? undefined,
        fieldMapping: (dto.fieldMapping as Prisma.InputJsonValue) ?? undefined,
        retryPolicy: (dto.retryPolicy as Prisma.InputJsonValue) ?? undefined,
      },
    });
  }

  async findByOrg(userId: string, orgId: string) {
    await this.ensureMembership(userId, orgId);

    return this.prisma.webhookDestination.findMany({
      where: { orgId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const webhook = await this.prisma.webhookDestination.findUnique({
      where: { id },
    });
    if (!webhook) {
      throw new NotFoundException('Webhook not found');
    }
    return webhook;
  }

  async update(userId: string, id: string, dto: UpdateWebhookDto) {
    const webhook = await this.findOne(id);
    await this.ensureMembership(userId, webhook.orgId);

    return this.prisma.webhookDestination.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.url !== undefined && { url: dto.url }),
        ...(dto.method !== undefined && { method: dto.method }),
        ...(dto.headers !== undefined && { headers: dto.headers as Prisma.InputJsonValue }),
        ...(dto.fieldMapping !== undefined && {
          fieldMapping: dto.fieldMapping as Prisma.InputJsonValue,
        }),
        ...(dto.retryPolicy !== undefined && {
          retryPolicy: dto.retryPolicy as Prisma.InputJsonValue,
        }),
        ...(dto.active !== undefined && { active: dto.active }),
      },
    });
  }

  async delete(userId: string, id: string) {
    const webhook = await this.findOne(id);
    await this.ensureMembership(userId, webhook.orgId);

    return this.prisma.webhookDestination.delete({ where: { id } });
  }

  async deliverWebhook(webhookId: string, submissionId: string, data: Record<string, unknown>) {
    const webhook = await this.findOne(webhookId);

    if (!webhook.active) {
      this.logger.warn(`Webhook ${webhookId} is inactive, skipping delivery`);
      return;
    }

    // Apply field mapping if configured
    let payload = data;
    const fieldMapping = webhook.fieldMapping as Record<string, string> | null;
    if (fieldMapping) {
      const mapped: Record<string, unknown> = {};
      for (const [questionId, destField] of Object.entries(fieldMapping)) {
        if (questionId in data) {
          mapped[destField] = data[questionId];
        }
      }
      payload = mapped;
    }

    const maxAttempts = 5;
    const baseDelayMs = 1000;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const startTime = Date.now();
      let statusCode: number | undefined;
      let responseBody: string | undefined;
      let errorMessage: string | undefined;
      let status: string;

      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);

        const requestHeaders: Record<string, string> = {
          'Content-Type': 'application/json',
          ...(webhook.headers as Record<string, string> | undefined),
        };

        const response = await fetch(webhook.url, {
          method: webhook.method,
          headers: requestHeaders,
          body: JSON.stringify(payload),
          signal: controller.signal,
        });

        clearTimeout(timeout);

        statusCode = response.status;
        responseBody = await response.text();
        status = response.ok ? 'success' : 'failed';
      } catch (err) {
        errorMessage = err instanceof Error ? err.message : 'Unknown delivery error';
        status = 'failed';
      }

      const durationMs = Date.now() - startTime;

      await this.prisma.webhookDeliveryLog.create({
        data: {
          webhookId,
          submissionId,
          status,
          statusCode,
          requestBody: payload as Prisma.InputJsonValue,
          responseBody,
          errorMessage,
          attempt,
          durationMs,
        },
      });

      if (status === 'success') {
        return;
      }

      this.logger.warn(
        `Webhook delivery attempt ${attempt}/${maxAttempts} failed for ${webhookId}: ${errorMessage ?? `HTTP ${statusCode}`}`,
      );

      if (attempt < maxAttempts) {
        const delay = baseDelayMs * Math.pow(2, attempt - 1);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    this.logger.error(`Webhook delivery exhausted all ${maxAttempts} attempts for ${webhookId}`);
  }

  async getDeliveryLogs(webhookId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      this.prisma.webhookDeliveryLog.findMany({
        where: { webhookId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.webhookDeliveryLog.count({ where: { webhookId } }),
    ]);

    return {
      logs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async replayDelivery(logId: string) {
    const log = await this.prisma.webhookDeliveryLog.findUnique({
      where: { id: logId },
    });
    if (!log) {
      throw new NotFoundException('Delivery log not found');
    }

    const requestBody = log.requestBody as Record<string, unknown> | null;
    await this.deliverWebhook(log.webhookId, log.submissionId, requestBody ?? {});

    return { replayed: true };
  }
}
