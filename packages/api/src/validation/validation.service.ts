import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { ValidateFieldDto } from './validation.dto';

export interface ValidationResult {
  valid: boolean;
  status: 'allow' | 'warn' | 'block';
  reason?: string;
}

@Injectable()
export class ValidationService {
  constructor(private readonly prisma: PrismaService) {}

  async validate(dto: ValidateFieldDto): Promise<ValidationResult> {
    const result =
      dto.type === 'email' ? this.validateEmail(dto.value) : this.validatePhone(dto.value);

    await this.incrementMeter(dto.orgId, dto.type);

    return result;
  }

  validateEmail(email: string): ValidationResult {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return { valid: false, status: 'block', reason: 'Invalid email format' };
    }

    // Placeholder: in production, add MX record lookup here
    const domain = email.split('@')[1];
    const disposableDomains = ['mailinator.com', 'tempmail.com', 'throwaway.email'];

    if (disposableDomains.includes(domain)) {
      return { valid: true, status: 'warn', reason: 'Disposable email provider detected' };
    }

    return { valid: true, status: 'allow' };
  }

  validatePhone(phone: string): ValidationResult {
    const digitsOnly = phone.replace(/[\s\-()+]/g, '');

    if (!/^\d+$/.test(digitsOnly)) {
      return { valid: false, status: 'block', reason: 'Phone number contains invalid characters' };
    }

    if (digitsOnly.length < 7 || digitsOnly.length > 15) {
      return {
        valid: false,
        status: 'block',
        reason: 'Phone number must be between 7 and 15 digits',
      };
    }

    return { valid: true, status: 'allow' };
  }

  async incrementMeter(orgId: string, type: string) {
    const now = new Date();
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    await this.prisma.validationMeter.upsert({
      where: {
        orgId_month_verificationType: {
          orgId,
          month,
          verificationType: type,
        },
      },
      update: {
        count: { increment: 1 },
      },
      create: {
        orgId,
        month,
        verificationType: type,
        count: 1,
      },
    });
  }

  async getUsage(orgId: string) {
    const now = new Date();
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const meters = await this.prisma.validationMeter.findMany({
      where: { orgId, month },
    });

    return {
      month,
      email: meters.find((m) => m.verificationType === 'email')?.count ?? 0,
      phone: meters.find((m) => m.verificationType === 'phone')?.count ?? 0,
    };
  }
}
