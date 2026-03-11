import {
  evaluateCondition,
  getVisibleQuestions,
  resolveNextStep,
  getReachableSteps,
  evaluateStep,
} from './logic-engine';
import { Step, Question, QuestionType, FormDefinition, LogicConditionOperator } from './types';

// --- Helpers ---

function makeQuestion(overrides: Partial<Question> = {}): Question {
  return {
    id: 'q1',
    type: QuestionType.SHORT_TEXT,
    label: 'Question 1',
    validations: {},
    ...overrides,
  };
}

function makeStep(overrides: Partial<Step> = {}): Step {
  return {
    id: 'step1',
    title: 'Step 1',
    order: 0,
    questions: [makeQuestion()],
    ...overrides,
  };
}

function makeForm(steps: Step[]): FormDefinition {
  return {
    id: 'form1',
    orgId: 'org1',
    title: 'Test Form',
    steps,
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
}

// --- evaluateCondition ---

describe('evaluateCondition', () => {
  describe('equals', () => {
    it('returns true when answer matches value', () => {
      expect(evaluateCondition('equals', 'yes', 'yes')).toBe(true);
    });

    it('returns false when answer does not match value', () => {
      expect(evaluateCondition('equals', 'no', 'yes')).toBe(false);
    });

    it('treats undefined answer as empty string', () => {
      expect(evaluateCondition('equals', undefined, '')).toBe(true);
      expect(evaluateCondition('equals', undefined, 'something')).toBe(false);
    });
  });

  describe('not_equals', () => {
    it('returns true when answer does not match value', () => {
      expect(evaluateCondition('not_equals', 'no', 'yes')).toBe(true);
    });

    it('returns false when answer matches value', () => {
      expect(evaluateCondition('not_equals', 'yes', 'yes')).toBe(false);
    });
  });

  describe('contains', () => {
    it('returns true when string answer contains value', () => {
      expect(evaluateCondition('contains', 'hello world', 'world')).toBe(true);
    });

    it('returns false when string answer does not contain value', () => {
      expect(evaluateCondition('contains', 'hello', 'world')).toBe(false);
    });

    it('returns true when array answer includes value', () => {
      expect(evaluateCondition('contains', ['a', 'b', 'c'], 'b')).toBe(true);
    });

    it('returns false when array answer does not include value', () => {
      expect(evaluateCondition('contains', ['a', 'b'], 'c')).toBe(false);
    });
  });

  describe('greater_than', () => {
    it('returns true when answer is greater than value', () => {
      expect(evaluateCondition('greater_than', '10', '5')).toBe(true);
    });

    it('returns false when answer is less than or equal to value', () => {
      expect(evaluateCondition('greater_than', '3', '5')).toBe(false);
      expect(evaluateCondition('greater_than', '5', '5')).toBe(false);
    });
  });

  describe('less_than', () => {
    it('returns true when answer is less than value', () => {
      expect(evaluateCondition('less_than', '3', '5')).toBe(true);
    });

    it('returns false when answer is greater than or equal to value', () => {
      expect(evaluateCondition('less_than', '10', '5')).toBe(false);
      expect(evaluateCondition('less_than', '5', '5')).toBe(false);
    });
  });

  describe('is_empty', () => {
    it('returns true for empty string', () => {
      expect(evaluateCondition('is_empty', '', '')).toBe(true);
    });

    it('returns true for whitespace-only string', () => {
      expect(evaluateCondition('is_empty', '   ', '')).toBe(true);
    });

    it('returns true for undefined', () => {
      expect(evaluateCondition('is_empty', undefined, '')).toBe(true);
    });

    it('returns true for empty array', () => {
      expect(evaluateCondition('is_empty', [], '')).toBe(true);
    });

    it('returns false for non-empty string', () => {
      expect(evaluateCondition('is_empty', 'hello', '')).toBe(false);
    });

    it('returns false for non-empty array', () => {
      expect(evaluateCondition('is_empty', ['a'], '')).toBe(false);
    });
  });

  it('returns false for unknown operator', () => {
    expect(evaluateCondition('unknown_op' as LogicConditionOperator, 'a', 'a')).toBe(false);
  });
});

// --- getVisibleQuestions ---

describe('getVisibleQuestions', () => {
  it('returns all questions when none have conditionalVisibility', () => {
    const q1 = makeQuestion({ id: 'q1' });
    const q2 = makeQuestion({ id: 'q2' });
    const step = makeStep({ questions: [q1, q2] });

    const result = getVisibleQuestions(step, {});
    expect(result).toHaveLength(2);
    expect(result.map((q) => q.id)).toEqual(['q1', 'q2']);
  });

  it('hides question when visibility condition is not met', () => {
    const q1 = makeQuestion({ id: 'q1' });
    const q2 = makeQuestion({
      id: 'q2',
      conditionalVisibility: {
        questionId: 'q1',
        condition: 'equals',
        value: 'show_me',
      },
    });
    const step = makeStep({ questions: [q1, q2] });

    const result = getVisibleQuestions(step, { q1: 'other' });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('q1');
  });

  it('shows question when visibility condition is met', () => {
    const q1 = makeQuestion({ id: 'q1' });
    const q2 = makeQuestion({
      id: 'q2',
      conditionalVisibility: {
        questionId: 'q1',
        condition: 'equals',
        value: 'show_me',
      },
    });
    const step = makeStep({ questions: [q1, q2] });

    const result = getVisibleQuestions(step, { q1: 'show_me' });
    expect(result).toHaveLength(2);
  });
});

// --- resolveNextStep ---

describe('resolveNextStep', () => {
  const step1 = makeStep({ id: 'step1', order: 0 });
  const step2 = makeStep({ id: 'step2', order: 1 });
  const step3 = makeStep({ id: 'step3', order: 2 });
  const allSteps = [step1, step2, step3];

  it('returns next sequential step when no logic rules match', () => {
    const result = resolveNextStep(step1, {}, allSteps);
    expect(result).toBe('step2');
  });

  it('returns null for the last step', () => {
    const result = resolveNextStep(step3, {}, allSteps);
    expect(result).toBeNull();
  });

  it('returns branched step when a logic rule matches', () => {
    const stepWithRule = makeStep({
      id: 'step1',
      order: 0,
      conditions: [
        {
          sourceQuestionId: 'q1',
          condition: 'equals',
          value: 'skip',
          targetStepId: 'step3',
        },
      ],
    });

    const result = resolveNextStep(stepWithRule, { q1: 'skip' }, allSteps);
    expect(result).toBe('step3');
  });

  it('falls through to sequential when no rule matches', () => {
    const stepWithRule = makeStep({
      id: 'step1',
      order: 0,
      conditions: [
        {
          sourceQuestionId: 'q1',
          condition: 'equals',
          value: 'skip',
          targetStepId: 'step3',
        },
      ],
    });

    const result = resolveNextStep(stepWithRule, { q1: 'no_skip' }, allSteps);
    expect(result).toBe('step2');
  });
});

// --- getReachableSteps ---

describe('getReachableSteps', () => {
  it('returns all steps in order when no branching', () => {
    const steps = [
      makeStep({ id: 's1', order: 0 }),
      makeStep({ id: 's2', order: 1 }),
      makeStep({ id: 's3', order: 2 }),
    ];
    const form = makeForm(steps);

    const result = getReachableSteps(form, {});
    expect(result).toEqual(['s1', 's2', 's3']);
  });

  it('skips steps when branching logic is active', () => {
    const steps = [
      makeStep({
        id: 's1',
        order: 0,
        conditions: [
          {
            sourceQuestionId: 'q1',
            condition: 'equals',
            value: 'skip',
            targetStepId: 's3',
          },
        ],
      }),
      makeStep({ id: 's2', order: 1 }),
      makeStep({ id: 's3', order: 2 }),
    ];
    const form = makeForm(steps);

    const result = getReachableSteps(form, { q1: 'skip' });
    expect(result).toEqual(['s1', 's3']);
  });

  it('handles cycles by stopping at visited steps', () => {
    const steps = [
      makeStep({
        id: 's1',
        order: 0,
        conditions: [
          {
            sourceQuestionId: 'q1',
            condition: 'equals',
            value: 'loop',
            targetStepId: 's1',
          },
        ],
      }),
      makeStep({ id: 's2', order: 1 }),
    ];
    const form = makeForm(steps);

    const result = getReachableSteps(form, { q1: 'loop' });
    // Should stop after s1 because s1 is already visited
    expect(result).toEqual(['s1']);
  });

  it('returns empty array for form with no steps', () => {
    const form = makeForm([]);
    expect(getReachableSteps(form, {})).toEqual([]);
  });
});

// --- evaluateStep ---

describe('evaluateStep', () => {
  it('returns visible questions and next step', () => {
    const steps = [
      makeStep({
        id: 's1',
        order: 0,
        questions: [makeQuestion({ id: 'q1' }), makeQuestion({ id: 'q2' })],
      }),
      makeStep({ id: 's2', order: 1 }),
    ];
    const form = makeForm(steps);

    const result = evaluateStep(form, 's1', {});
    expect(result.visibleQuestions).toHaveLength(2);
    expect(result.nextStepId).toBe('s2');
  });

  it('returns empty for non-existent step', () => {
    const form = makeForm([makeStep({ id: 's1', order: 0 })]);

    const result = evaluateStep(form, 'nonexistent', {});
    expect(result.visibleQuestions).toEqual([]);
    expect(result.nextStepId).toBeNull();
  });

  it('filters questions based on visibility and resolves branching', () => {
    const steps = [
      makeStep({
        id: 's1',
        order: 0,
        questions: [
          makeQuestion({ id: 'q1' }),
          makeQuestion({
            id: 'q2',
            conditionalVisibility: {
              questionId: 'q1',
              condition: 'equals',
              value: 'show',
            },
          }),
        ],
        conditions: [
          {
            sourceQuestionId: 'q1',
            condition: 'equals',
            value: 'branch',
            targetStepId: 's3',
          },
        ],
      }),
      makeStep({ id: 's2', order: 1 }),
      makeStep({ id: 's3', order: 2 }),
    ];
    const form = makeForm(steps);

    // q2 hidden, branches to s3
    const result = evaluateStep(form, 's1', { q1: 'branch' });
    expect(result.visibleQuestions).toHaveLength(1);
    expect(result.visibleQuestions[0].id).toBe('q1');
    expect(result.nextStepId).toBe('s3');
  });
});
