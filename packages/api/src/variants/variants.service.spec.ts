import { Test, TestingModule } from '@nestjs/testing';
import { VariantsService } from './variants.service';
import { FormsService } from '../forms/forms.service';
import { PrismaService } from '../prisma.service';

describe('VariantsService', () => {
  let service: VariantsService;

  const mockPrisma = {
    formVariant: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    orgMembership: {
      findUnique: jest.fn(),
    },
  };

  const mockFormsService = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VariantsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: FormsService, useValue: mockFormsService },
      ],
    }).compile();

    service = module.get<VariantsService>(VariantsService);
    jest.clearAllMocks();
  });

  describe('assignVariant', () => {
    it('falls back to form definition when no active variants exist', async () => {
      const formDef = { title: 'Test' };
      mockPrisma.formVariant.findMany.mockResolvedValue([]);
      mockFormsService.findOne.mockResolvedValue({
        id: 'form1',
        definition: formDef,
      });

      const result = await service.assignVariant('form1');
      expect(result.variantId).toBeNull();
      expect(result.definition).toEqual(formDef);
    });

    it('selects a variant when only one active variant exists', async () => {
      const variant = {
        id: 'v1',
        weight: 100,
        definition: { title: 'Variant A' },
        active: true,
      };
      mockPrisma.formVariant.findMany.mockResolvedValue([variant]);

      const result = await service.assignVariant('form1');
      expect(result.variantId).toBe('v1');
      expect(result.definition).toEqual({ title: 'Variant A' });
    });

    it('distributes selections approximately according to weights', async () => {
      const variants = [
        { id: 'v1', weight: 70, definition: { title: 'A' }, active: true },
        { id: 'v2', weight: 30, definition: { title: 'B' }, active: true },
      ];
      mockPrisma.formVariant.findMany.mockResolvedValue(variants);

      const counts: Record<string, number> = { v1: 0, v2: 0 };
      const iterations = 10000;

      for (let i = 0; i < iterations; i++) {
        const result = await service.assignVariant('form1');
        counts[result.variantId!]++;
      }

      // v1 should get ~70% of selections (allow 5% tolerance)
      const v1Ratio = counts.v1 / iterations;
      expect(v1Ratio).toBeGreaterThan(0.63);
      expect(v1Ratio).toBeLessThan(0.77);

      // v2 should get ~30%
      const v2Ratio = counts.v2 / iterations;
      expect(v2Ratio).toBeGreaterThan(0.23);
      expect(v2Ratio).toBeLessThan(0.37);
    });

    it('handles three variants with different weights', async () => {
      const variants = [
        { id: 'v1', weight: 50, definition: { title: 'A' }, active: true },
        { id: 'v2', weight: 30, definition: { title: 'B' }, active: true },
        { id: 'v3', weight: 20, definition: { title: 'C' }, active: true },
      ];
      mockPrisma.formVariant.findMany.mockResolvedValue(variants);

      const counts: Record<string, number> = { v1: 0, v2: 0, v3: 0 };
      const iterations = 10000;

      for (let i = 0; i < iterations; i++) {
        const result = await service.assignVariant('form1');
        counts[result.variantId!]++;
      }

      // Each variant should be within 7% of expected ratio
      expect(counts.v1 / iterations).toBeGreaterThan(0.43);
      expect(counts.v1 / iterations).toBeLessThan(0.57);
      expect(counts.v2 / iterations).toBeGreaterThan(0.23);
      expect(counts.v2 / iterations).toBeLessThan(0.37);
      expect(counts.v3 / iterations).toBeGreaterThan(0.13);
      expect(counts.v3 / iterations).toBeLessThan(0.27);
    });
  });
});
