import { Test, TestingModule } from '@nestjs/testing';
import { ValidationService } from './validation.service';
import { PrismaService } from '../prisma.service';

describe('ValidationService', () => {
  let service: ValidationService;

  const mockPrisma = {
    validationMeter: {
      upsert: jest.fn(),
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ValidationService, { provide: PrismaService, useValue: mockPrisma }],
    }).compile();

    service = module.get<ValidationService>(ValidationService);
    jest.clearAllMocks();
  });

  describe('validateEmail', () => {
    it('accepts a valid email', () => {
      const result = service.validateEmail('user@example.com');
      expect(result.valid).toBe(true);
      expect(result.status).toBe('allow');
    });

    it('accepts email with subdomains', () => {
      const result = service.validateEmail('user@mail.example.co.uk');
      expect(result.valid).toBe(true);
      expect(result.status).toBe('allow');
    });

    it('rejects email without @', () => {
      const result = service.validateEmail('userexample.com');
      expect(result.valid).toBe(false);
      expect(result.status).toBe('block');
      expect(result.reason).toContain('Invalid email');
    });

    it('rejects email without domain', () => {
      const result = service.validateEmail('user@');
      expect(result.valid).toBe(false);
      expect(result.status).toBe('block');
    });

    it('rejects email with spaces', () => {
      const result = service.validateEmail('user @example.com');
      expect(result.valid).toBe(false);
      expect(result.status).toBe('block');
    });

    it('rejects empty string', () => {
      const result = service.validateEmail('');
      expect(result.valid).toBe(false);
      expect(result.status).toBe('block');
    });

    it('warns for disposable email (mailinator.com)', () => {
      const result = service.validateEmail('test@mailinator.com');
      expect(result.valid).toBe(true);
      expect(result.status).toBe('warn');
      expect(result.reason).toContain('Disposable');
    });

    it('warns for disposable email (tempmail.com)', () => {
      const result = service.validateEmail('test@tempmail.com');
      expect(result.valid).toBe(true);
      expect(result.status).toBe('warn');
    });

    it('warns for disposable email (throwaway.email)', () => {
      const result = service.validateEmail('test@throwaway.email');
      expect(result.valid).toBe(true);
      expect(result.status).toBe('warn');
    });
  });

  describe('validatePhone', () => {
    it('accepts a valid phone number', () => {
      const result = service.validatePhone('5551234567');
      expect(result.valid).toBe(true);
      expect(result.status).toBe('allow');
    });

    it('accepts phone with formatting characters', () => {
      const result = service.validatePhone('+1 (555) 123-4567');
      expect(result.valid).toBe(true);
      expect(result.status).toBe('allow');
    });

    it('accepts international phone number', () => {
      const result = service.validatePhone('+44 20 7946 0958');
      expect(result.valid).toBe(true);
      expect(result.status).toBe('allow');
    });

    it('rejects phone with letters', () => {
      const result = service.validatePhone('555-CALL-ME');
      expect(result.valid).toBe(false);
      expect(result.status).toBe('block');
      expect(result.reason).toContain('invalid characters');
    });

    it('rejects phone that is too short (< 7 digits)', () => {
      const result = service.validatePhone('12345');
      expect(result.valid).toBe(false);
      expect(result.status).toBe('block');
      expect(result.reason).toContain('7 and 15');
    });

    it('rejects phone that is too long (> 15 digits)', () => {
      const result = service.validatePhone('1234567890123456');
      expect(result.valid).toBe(false);
      expect(result.status).toBe('block');
      expect(result.reason).toContain('7 and 15');
    });

    it('accepts minimum length phone (7 digits)', () => {
      const result = service.validatePhone('1234567');
      expect(result.valid).toBe(true);
      expect(result.status).toBe('allow');
    });

    it('accepts maximum length phone (15 digits)', () => {
      const result = service.validatePhone('123456789012345');
      expect(result.valid).toBe(true);
      expect(result.status).toBe('allow');
    });
  });
});
