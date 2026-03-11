import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface CaptchaResult {
  success: boolean;
  score?: number;
}

interface RateCheckResult {
  allowed: boolean;
  reason?: string;
}

interface SubmissionRecord {
  timestamps: number[];
}

const RATE_LIMIT_WINDOW_MS = 60_000; // 60 seconds
const RATE_LIMIT_MAX = 5; // 5 submissions per IP per form per minute

@Injectable()
export class BotProtectionService {
  private submissionMap = new Map<string, SubmissionRecord>();

  constructor(private readonly configService: ConfigService) {}

  async validateCaptcha(
    token: string,
    provider: 'turnstile' | 'recaptcha',
  ): Promise<CaptchaResult> {
    if (provider === 'turnstile') {
      return this.validateTurnstile(token);
    }
    return this.validateRecaptcha(token);
  }

  checkSubmissionRate(ip: string, formId: string): RateCheckResult {
    const key = `${ip}:${formId}`;
    const now = Date.now();
    const record = this.submissionMap.get(key);

    if (!record) {
      this.submissionMap.set(key, { timestamps: [now] });
      return { allowed: true };
    }

    // Prune timestamps outside the window
    record.timestamps = record.timestamps.filter((ts) => now - ts < RATE_LIMIT_WINDOW_MS);

    if (record.timestamps.length >= RATE_LIMIT_MAX) {
      return {
        allowed: false,
        reason: `Rate limit exceeded: max ${RATE_LIMIT_MAX} submissions per form per minute`,
      };
    }

    record.timestamps.push(now);
    return { allowed: true };
  }

  private async validateTurnstile(token: string): Promise<CaptchaResult> {
    const secret = this.configService.get<string>('TURNSTILE_SECRET_KEY');
    if (!secret) {
      console.warn('TURNSTILE_SECRET_KEY not configured, skipping validation');
      return { success: true };
    }

    try {
      const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ secret, response: token }).toString(),
      });

      const data = (await response.json()) as Record<string, unknown>;
      return {
        success: Boolean(data.success),
        score: typeof data.score === 'number' ? data.score : undefined,
      };
    } catch (error) {
      console.error('Turnstile validation failed:', error);
      return { success: false };
    }
  }

  private async validateRecaptcha(token: string): Promise<CaptchaResult> {
    const secret = this.configService.get<string>('RECAPTCHA_SECRET_KEY');
    if (!secret) {
      console.warn('RECAPTCHA_SECRET_KEY not configured, skipping validation');
      return { success: true };
    }

    try {
      const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ secret, response: token }).toString(),
      });

      const data = (await response.json()) as Record<string, unknown>;
      return {
        success: Boolean(data.success),
        score: typeof data.score === 'number' ? data.score : undefined,
      };
    } catch (error) {
      console.error('reCAPTCHA validation failed:', error);
      return { success: false };
    }
  }
}
