import { Injectable, ForbiddenException, NotFoundException, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma.service';
import { CreateIntegrationDto, UpdateIntegrationDto } from './integrations.dto';
import * as hubspot from './providers/hubspot.provider';
import * as salesforce from './providers/salesforce.provider';
import * as leadspedia from './providers/leadspedia.provider';
import * as cake from './providers/cake.provider';

@Injectable()
export class IntegrationsService {
  private readonly logger = new Logger(IntegrationsService.name);

  constructor(private readonly prisma: PrismaService) {}

  private async verifyOrgMembership(userId: string, orgId: string) {
    const membership = await this.prisma.orgMembership.findUnique({
      where: { userId_orgId: { userId, orgId } },
    });
    if (!membership) {
      throw new ForbiddenException('You are not a member of this organization');
    }
    return membership;
  }

  async create(userId: string, dto: CreateIntegrationDto) {
    await this.verifyOrgMembership(userId, dto.orgId);

    const integration = await this.prisma.integration.create({
      data: {
        orgId: dto.orgId,
        type: dto.type,
        provider: dto.provider,
        config: dto.config as Prisma.InputJsonValue,
        credentials: dto.credentials ? (dto.credentials as Prisma.InputJsonValue) : undefined,
        fieldMapping: dto.fieldMapping ? (dto.fieldMapping as Prisma.InputJsonValue) : undefined,
        active: true,
      },
    });

    this.logger.log(`Integration created: ${integration.id} (${dto.provider})`);
    return integration;
  }

  async findByOrg(userId: string, orgId: string) {
    await this.verifyOrgMembership(userId, orgId);

    return this.prisma.integration.findMany({
      where: { orgId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const integration = await this.prisma.integration.findUnique({
      where: { id },
    });
    if (!integration) {
      throw new NotFoundException('Integration not found');
    }
    return integration;
  }

  async update(userId: string, id: string, dto: UpdateIntegrationDto) {
    const integration = await this.findOne(id);
    await this.verifyOrgMembership(userId, integration.orgId);

    const updated = await this.prisma.integration.update({
      where: { id },
      data: {
        ...(dto.config !== undefined && {
          config: dto.config as Prisma.InputJsonValue,
        }),
        ...(dto.credentials !== undefined && {
          credentials: dto.credentials as Prisma.InputJsonValue,
        }),
        ...(dto.fieldMapping !== undefined && {
          fieldMapping: dto.fieldMapping as Prisma.InputJsonValue,
        }),
        ...(dto.active !== undefined && { active: dto.active }),
      },
    });

    this.logger.log(`Integration updated: ${id}`);
    return updated;
  }

  async delete(userId: string, id: string) {
    const integration = await this.findOne(id);
    await this.verifyOrgMembership(userId, integration.orgId);

    await this.prisma.integration.delete({ where: { id } });
    this.logger.log(`Integration deleted: ${id}`);
  }

  async testConnection(integrationId: string) {
    const integration = await this.findOne(integrationId);
    const creds = (integration.credentials ?? {}) as Record<string, string>;

    switch (integration.provider) {
      case 'hubspot': {
        const result = await hubspot.testConnection(creds.accessToken);
        return { connected: result.success, details: result.body };
      }
      case 'salesforce': {
        const result = await salesforce.testConnection(creds.instanceUrl, creds.accessToken);
        return { connected: result.success, details: result.body };
      }
      case 'leadspedia':
      case 'cake':
        return { connected: true };
      default:
        return { connected: false, details: 'Unknown provider' };
    }
  }

  async deliverToIntegration(
    integrationId: string,
    submissionId: string,
    data: Record<string, unknown>,
  ) {
    const integration = await this.findOne(integrationId);
    const creds = (integration.credentials ?? {}) as Record<string, string>;
    const config = (integration.config ?? {}) as Record<string, string>;
    const fieldMapping = (integration.fieldMapping ?? {}) as Record<string, string>;

    // Map submission data using fieldMapping
    const mappedData: Record<string, unknown> = {};
    for (const [sourceKey, targetKey] of Object.entries(fieldMapping)) {
      if (data[sourceKey] !== undefined) {
        mappedData[targetKey] = data[sourceKey];
      }
    }
    // If no field mapping, use data as-is
    const deliveryData = Object.keys(mappedData).length > 0 ? mappedData : data;

    const startTime = Date.now();
    let result: { success: boolean; statusCode: number | null; body: unknown };

    try {
      switch (integration.provider) {
        case 'hubspot':
          result = await hubspot.createContact(creds.accessToken, deliveryData);
          break;
        case 'salesforce':
          result = await salesforce.createLead(creds.instanceUrl, creds.accessToken, deliveryData);
          break;
        case 'leadspedia':
          result = await leadspedia.postLead(
            config.endpointUrl,
            creds as Record<string, string>,
            deliveryData,
          );
          break;
        case 'cake':
          result = await cake.postConversion(config.endpointUrl, deliveryData);
          break;
        default:
          result = {
            success: false,
            statusCode: null,
            body: 'Unknown provider',
          };
      }
    } catch (error) {
      result = {
        success: false,
        statusCode: null,
        body: {
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }

    const durationMs = Date.now() - startTime;

    // Log delivery
    const log = await this.prisma.integrationDeliveryLog.create({
      data: {
        integrationId,
        submissionId,
        status: result.success ? 'success' : 'failed',
        statusCode: result.statusCode,
        requestBody: deliveryData as Prisma.InputJsonValue,
        responseBody: result.body ? JSON.stringify(result.body) : null,
        errorMessage: result.success
          ? null
          : typeof result.body === 'object'
            ? JSON.stringify(result.body)
            : String(result.body),
        attempt: 1,
        durationMs,
      },
    });

    this.logger.log(
      `Delivery ${result.success ? 'succeeded' : 'failed'} for integration ${integrationId}, submission ${submissionId} (${durationMs}ms)`,
    );

    return { deliveryLog: log, result };
  }

  async getDeliveryLogs(integrationId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      this.prisma.integrationDeliveryLog.findMany({
        where: { integrationId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.integrationDeliveryLog.count({
        where: { integrationId },
      }),
    ]);

    return {
      logs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async refreshOAuthToken(integrationId: string) {
    const integration = await this.findOne(integrationId);
    const creds = (integration.credentials ?? {}) as Record<string, string>;

    // Stub: In production, this would call the provider's OAuth token refresh endpoint
    // using creds.refreshToken to obtain a new accessToken.
    this.logger.warn(
      `refreshOAuthToken called for integration ${integrationId} (provider: ${integration.provider}) - stub implementation`,
    );

    // Store the (unchanged) token back as a placeholder
    await this.prisma.integration.update({
      where: { id: integrationId },
      data: {
        credentials: {
          ...creds,
          lastRefreshAttempt: new Date().toISOString(),
        } as Prisma.InputJsonValue,
      },
    });

    return { refreshed: false, message: 'Token refresh not yet implemented' };
  }
}
