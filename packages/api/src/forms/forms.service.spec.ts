import { Test, TestingModule } from '@nestjs/testing';
import { FormsService } from './forms.service';
import { PrismaService } from '../prisma.service';
import { FormDefinition, QuestionType } from '@flipflow/shared';

describe('FormsService', () => {
  let service: FormsService;

  const mockPrisma = {
    form: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findFirst: jest.fn(),
    },
    orgMembership: {
      findUnique: jest.fn(),
    },
    formSubmission: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FormsService, { provide: PrismaService, useValue: mockPrisma }],
    }).compile();

    service = module.get<FormsService>(FormsService);
    jest.clearAllMocks();
  });

  describe('evaluateFormStep', () => {
    const definition: FormDefinition = {
      id: 'form1',
      orgId: 'org1',
      title: 'Test Form',
      steps: [
        {
          id: 'step1',
          title: 'Step 1',
          order: 0,
          questions: [
            {
              id: 'q1',
              type: QuestionType.SHORT_TEXT,
              label: 'Name',
              validations: {},
            },
            {
              id: 'q2',
              type: QuestionType.SHORT_TEXT,
              label: 'Conditional',
              validations: {},
              conditionalVisibility: {
                questionId: 'q1',
                condition: 'equals',
                value: 'show',
              },
            },
          ],
          conditions: [
            {
              sourceQuestionId: 'q1',
              condition: 'equals',
              value: 'jump',
              targetStepId: 'step3',
            },
          ],
        },
        {
          id: 'step2',
          title: 'Step 2',
          order: 1,
          questions: [],
        },
        {
          id: 'step3',
          title: 'Step 3',
          order: 2,
          questions: [],
        },
      ],
      theme: {
        primaryColor: '#000',
        backgroundColor: '#fff',
        fontFamily: 'sans-serif',
        borderRadius: 4,
        buttonStyle: 'filled',
      },
      settings: {
        showProgressBar: true,
        allowBackNavigation: true,
        submitButtonText: 'Submit',
      },
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
    };

    it('returns all visible questions and next sequential step', () => {
      const result = service.evaluateFormStep(definition, 'step1', {});
      // q2 is hidden because q1 !== 'show'
      expect(result.visibleQuestions).toHaveLength(1);
      expect(result.visibleQuestions[0].id).toBe('q1');
      // No logic match, so next is step2
      expect(result.nextStepId).toBe('step2');
    });

    it('shows conditional question when condition is met', () => {
      const result = service.evaluateFormStep(definition, 'step1', { q1: 'show' });
      expect(result.visibleQuestions).toHaveLength(2);
      expect(result.nextStepId).toBe('step2');
    });

    it('follows branching logic when rule matches', () => {
      const result = service.evaluateFormStep(definition, 'step1', { q1: 'jump' });
      expect(result.nextStepId).toBe('step3');
    });

    it('returns empty result for non-existent step', () => {
      const result = service.evaluateFormStep(definition, 'nonexistent', {});
      expect(result.visibleQuestions).toEqual([]);
      expect(result.nextStepId).toBeNull();
    });
  });
});
