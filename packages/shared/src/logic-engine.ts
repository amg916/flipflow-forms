import {
  FormDefinition,
  Step,
  Question,
  LogicRule,
  LogicConditionOperator,
  VisibilityConditionOperator,
} from './types';

/** Map of questionId → user's answer value(s) */
export type FormAnswers = Record<string, string | string[]>;

/** Result of evaluating logic for a given step */
export interface StepEvaluation {
  visibleQuestions: Question[];
  nextStepId: string | null;
}

/** Evaluate a single condition against an answer value */
export function evaluateCondition(
  operator: LogicConditionOperator | VisibilityConditionOperator,
  answer: string | string[] | undefined,
  value: string,
): boolean {
  const answerStr = Array.isArray(answer) ? answer.join(',') : (answer ?? '');

  switch (operator) {
    case 'equals':
      return answerStr === value;
    case 'not_equals':
      return answerStr !== value;
    case 'contains':
      if (Array.isArray(answer)) {
        return answer.includes(value);
      }
      return answerStr.includes(value);
    case 'greater_than':
      return parseFloat(answerStr) > parseFloat(value);
    case 'less_than':
      return parseFloat(answerStr) < parseFloat(value);
    case 'is_empty':
      if (Array.isArray(answer)) return answer.length === 0;
      return !answerStr || answerStr.trim() === '';
    default:
      return false;
  }
}

/** Get the visible questions for a step based on current answers */
export function getVisibleQuestions(step: Step, answers: FormAnswers): Question[] {
  return step.questions.filter((q) => {
    if (!q.conditionalVisibility) return true;
    const { questionId, condition, value } = q.conditionalVisibility;
    return evaluateCondition(condition, answers[questionId], value);
  });
}

/** Resolve which step to go to next based on a step's logic rules */
export function resolveNextStep(step: Step, answers: FormAnswers, allSteps: Step[]): string | null {
  // Check logic rules in order — first match wins
  if (step.conditions) {
    for (const rule of step.conditions) {
      const answer = answers[rule.sourceQuestionId];
      if (evaluateCondition(rule.condition, answer, rule.value)) {
        return rule.targetStepId;
      }
    }
  }

  // Default: go to next step by order
  const sorted = [...allSteps].sort((a, b) => a.order - b.order);
  const currentIndex = sorted.findIndex((s) => s.id === step.id);
  if (currentIndex >= 0 && currentIndex < sorted.length - 1) {
    return sorted[currentIndex + 1].id;
  }

  return null; // last step — submit
}

/** Evaluate a step: get visible questions and determine next step */
export function evaluateStep(
  form: FormDefinition,
  stepId: string,
  answers: FormAnswers,
): StepEvaluation {
  const step = form.steps.find((s) => s.id === stepId);
  if (!step) {
    return { visibleQuestions: [], nextStepId: null };
  }

  return {
    visibleQuestions: getVisibleQuestions(step, answers),
    nextStepId: resolveNextStep(step, answers, form.steps),
  };
}

/** Get all reachable step IDs from a given starting step based on answers */
export function getReachableSteps(form: FormDefinition, answers: FormAnswers): string[] {
  const sorted = [...form.steps].sort((a, b) => a.order - b.order);
  if (sorted.length === 0) return [];

  const reachable: string[] = [];
  let currentId: string | null = sorted[0].id;
  const visited = new Set<string>();

  while (currentId && !visited.has(currentId)) {
    visited.add(currentId);
    reachable.push(currentId);
    const step = form.steps.find((s) => s.id === currentId);
    if (!step) break;
    currentId = resolveNextStep(step, answers, form.steps);
  }

  return reachable;
}
