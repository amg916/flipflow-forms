import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma.service';
import { TrackEventDto } from './analytics.dto';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async trackEvent(dto: TrackEventDto) {
    return this.prisma.analyticsEvent.create({
      data: {
        type: dto.type,
        formId: dto.formId,
        sessionId: dto.sessionId,
        variantId: dto.variantId,
        stepId: dto.stepId,
        questionId: dto.questionId,
        utmSource: dto.utmSource,
        utmMedium: dto.utmMedium,
        utmCampaign: dto.utmCampaign,
        metadata: (dto.metadata as Prisma.InputJsonValue) ?? undefined,
      },
    });
  }

  async trackBatch(events: TrackEventDto[]) {
    return this.prisma.analyticsEvent.createMany({
      data: events.map((dto) => ({
        type: dto.type,
        formId: dto.formId,
        sessionId: dto.sessionId,
        variantId: dto.variantId,
        stepId: dto.stepId,
        questionId: dto.questionId,
        utmSource: dto.utmSource,
        utmMedium: dto.utmMedium,
        utmCampaign: dto.utmCampaign,
        metadata: (dto.metadata as Prisma.InputJsonValue) ?? undefined,
      })),
    });
  }

  async getFormAnalytics(formId: string) {
    return this.buildAnalytics(formId);
  }

  async getFormAnalyticsByDateRange(formId: string, startDate: Date, endDate: Date) {
    return this.buildAnalytics(formId, startDate, endDate);
  }

  private async buildAnalytics(formId: string, startDate?: Date, endDate?: Date) {
    const dateFilter = startDate && endDate ? { createdAt: { gte: startDate, lte: endDate } } : {};

    const whereBase = { formId, ...dateFilter };

    // Count events by type
    const typeCounts = await this.prisma.analyticsEvent.groupBy({
      by: ['type'],
      where: whereBase,
      _count: { id: true },
    });

    const countByType = (type: string) => typeCounts.find((t) => t.type === type)?._count.id ?? 0;

    const totalVisits = countByType('visit');
    const formStarts = countByType('form_start');
    const submissions = countByType('submit_success');

    // Step funnel: group by stepId + type
    const stepGroups = await this.prisma.analyticsEvent.groupBy({
      by: ['stepId', 'type'],
      where: {
        ...whereBase,
        stepId: { not: null },
        type: { in: ['step_view', 'step_submit'] },
      },
      _count: { id: true },
    });

    // Build funnel per step
    const stepMap = new Map<string, { views: number; submits: number }>();

    for (const group of stepGroups) {
      if (!group.stepId) continue;
      const existing = stepMap.get(group.stepId) ?? {
        views: 0,
        submits: 0,
      };
      if (group.type === 'step_view') {
        existing.views = group._count.id;
      } else if (group.type === 'step_submit') {
        existing.submits = group._count.id;
      }
      stepMap.set(group.stepId, existing);
    }

    const stepFunnel = Array.from(stepMap.entries()).map(([stepId, stats]) => ({
      stepId,
      views: stats.views,
      submits: stats.submits,
      dropOffRate:
        stats.views > 0
          ? Number((((stats.views - stats.submits) / stats.views) * 100).toFixed(2))
          : 0,
    }));

    const conversionRate =
      totalVisits > 0 ? Number(((submissions / totalVisits) * 100).toFixed(2)) : 0;

    return {
      totalVisits,
      formStarts,
      submissions,
      conversionRate,
      stepFunnel,
    };
  }
}
