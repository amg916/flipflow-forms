import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma.service';
import { SubmitConsentDto } from './compliance.dto';

@Injectable()
export class ComplianceService {
  private readonly logger = new Logger(ComplianceService.name);

  constructor(private readonly prisma: PrismaService) {}

  async recordConsent(dto: SubmitConsentDto) {
    const submission = await this.prisma.formSubmission.findUnique({
      where: { id: dto.submissionId },
    });

    if (!submission) {
      throw new NotFoundException(`Submission ${dto.submissionId} not found`);
    }

    const existingMetadata = (submission.metadata as Record<string, unknown>) || {};

    const consentData: Record<string, unknown> = {
      consentText: dto.consentText,
      consentTimestamp: dto.consentTimestamp,
      consentRecordedAt: new Date().toISOString(),
    };

    if (dto.trustedFormCertUrl) {
      consentData.trustedFormCertUrl = dto.trustedFormCertUrl;
    }

    if (dto.jornayaToken) {
      consentData.jornayaToken = dto.jornayaToken;
    }

    const updated = await this.prisma.formSubmission.update({
      where: { id: dto.submissionId },
      data: {
        ip: dto.ip,
        userAgent: dto.userAgent,
        consentTimestamp: new Date(dto.consentTimestamp),
        metadata: {
          ...existingMetadata,
          consent: consentData,
        } as Prisma.InputJsonValue,
      },
    });

    this.logger.log(`Consent recorded for submission ${dto.submissionId}`);

    return { submissionId: updated.id, recorded: true };
  }

  async getComplianceData(formId: string, startDate?: string, endDate?: string) {
    const where: Record<string, unknown> = {
      formId,
      consentTimestamp: { not: null },
    };

    if (startDate || endDate) {
      const dateFilter: Record<string, Date> = {};
      if (startDate) dateFilter.gte = new Date(startDate);
      if (endDate) dateFilter.lte = new Date(endDate);
      where.consentTimestamp = { ...dateFilter, not: null };
    }

    const submissions = await this.prisma.formSubmission.findMany({
      where,
      select: {
        id: true,
        consentTimestamp: true,
        ip: true,
        userAgent: true,
        metadata: true,
      },
      orderBy: { consentTimestamp: 'desc' },
    });

    return submissions.map((s) => {
      const meta = (s.metadata as Record<string, unknown>) || {};
      const consent = (meta.consent as Record<string, unknown>) || {};
      return {
        submissionId: s.id,
        consentTimestamp: s.consentTimestamp?.toISOString() ?? null,
        ip: s.ip,
        userAgent: s.userAgent,
        trustedFormCertUrl: (consent.trustedFormCertUrl as string) ?? null,
        jornayaToken: (consent.jornayaToken as string) ?? null,
      };
    });
  }

  async exportComplianceCsv(formId: string, startDate?: string, endDate?: string): Promise<string> {
    const data = await this.getComplianceData(formId, startDate, endDate);

    const headers = [
      'submission_id',
      'consent_timestamp',
      'ip',
      'user_agent',
      'trusted_form_cert_url',
      'jornaya_token',
    ];

    const rows = data.map((row) =>
      [
        this.escapeCsv(row.submissionId),
        this.escapeCsv(row.consentTimestamp ?? ''),
        this.escapeCsv(row.ip ?? ''),
        this.escapeCsv(row.userAgent ?? ''),
        this.escapeCsv(row.trustedFormCertUrl ?? ''),
        this.escapeCsv(row.jornayaToken ?? ''),
      ].join(','),
    );

    return [headers.join(','), ...rows].join('\n');
  }

  private escapeCsv(value: string): string {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }
}
