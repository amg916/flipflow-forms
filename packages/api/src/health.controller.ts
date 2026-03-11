import { Controller, Get } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Controller()
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  /** Liveness probe — always returns ok if the process is running. */
  @Get('health')
  health() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  /** Readiness probe — checks downstream dependencies before accepting traffic. */
  @Get('ready')
  async ready() {
    const checks: Record<string, { status: string; latencyMs: number }> = {};

    // Database check
    const dbStart = Date.now();
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      checks.database = { status: 'ok', latencyMs: Date.now() - dbStart };
    } catch {
      checks.database = { status: 'unhealthy', latencyMs: Date.now() - dbStart };
    }

    const overallStatus = Object.values(checks).every((c) => c.status === 'ok') ? 'ok' : 'degraded';

    return {
      status: overallStatus,
      checks,
      timestamp: new Date().toISOString(),
    };
  }
}
