// --- Enums ---

export enum OrgRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  EDITOR = 'editor',
  ANALYST = 'analyst',
}

export enum QuestionType {
  SHORT_TEXT = 'short_text',
  LONG_TEXT = 'long_text',
  EMAIL = 'email',
  PHONE = 'phone',
  NUMBER = 'number',
  URL = 'url',
  SINGLE_CHOICE = 'single_choice',
  MULTIPLE_CHOICE = 'multiple_choice',
  DROPDOWN = 'dropdown',
  DATE = 'date',
  FILE_UPLOAD = 'file_upload',
  RATING = 'rating',
  YES_NO = 'yes_no',
  LEGAL = 'legal',
}

// --- Logic Condition Types ---

export type LogicConditionOperator =
  | 'equals'
  | 'not_equals'
  | 'contains'
  | 'greater_than'
  | 'less_than'
  | 'is_empty';

export type VisibilityConditionOperator = 'equals' | 'not_equals' | 'contains' | 'is_empty';

// --- Form Schema Types ---

export interface FormValidation {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  min?: number;
  max?: number;
}

export interface QuestionOption {
  id: string;
  label: string;
  value: string;
}

export interface LogicRule {
  sourceQuestionId: string;
  condition: LogicConditionOperator;
  value: string;
  targetStepId: string;
}

export interface Question {
  id: string;
  type: QuestionType;
  label: string;
  placeholder?: string;
  description?: string;
  validations: FormValidation;
  options?: QuestionOption[];
  conditionalVisibility?: {
    questionId: string;
    condition: VisibilityConditionOperator;
    value: string;
  };
}

export interface Step {
  id: string;
  title: string;
  order: number;
  questions: Question[];
  conditions?: LogicRule[];
}

export interface FormTheme {
  primaryColor: string;
  backgroundColor: string;
  fontFamily: string;
  borderRadius: number;
  buttonStyle: 'filled' | 'outlined';
}

export interface FormSettings {
  showProgressBar: boolean;
  allowBackNavigation: boolean;
  submitButtonText: string;
  redirectUrl?: string;
  notificationEmail?: string;
}

export interface FormDefinition {
  id: string;
  orgId: string;
  title: string;
  description?: string;
  steps: Step[];
  theme: FormTheme;
  settings: FormSettings;
  thankYouPage?: ThankYouPageConfig;
  createdAt: string;
  updatedAt: string;
}

// --- Thank-You Page Types ---

export type ThankYouBlockType = 'heading' | 'text' | 'button' | 'offer' | 'script';

export interface ThankYouBlock {
  id: string;
  type: ThankYouBlockType;
  content: string;
  /** URL for button/offer blocks */
  url?: string;
  /** Description for offer blocks */
  description?: string;
}

export interface ThankYouPageConfig {
  enabled: boolean;
  blocks: ThankYouBlock[];
}

// --- Template Types ---

export type TemplateVertical =
  | 'solar'
  | 'insurance'
  | 'mortgage'
  | 'home_services'
  | 'real_estate'
  | 'general';

export interface TemplateInfo {
  id: string;
  title: string;
  description: string;
  vertical: TemplateVertical;
  definition: FormDefinition;
  thankYouPage?: ThankYouPageConfig;
  createdAt: string;
}

// --- Analytics Event Types ---

export type AnalyticsEventType =
  | 'visit'
  | 'form_start'
  | 'step_view'
  | 'step_submit'
  | 'validation_fail'
  | 'submit_success'
  | 'abandon';

export interface AnalyticsEvent {
  type: AnalyticsEventType;
  formId: string;
  sessionId: string;
  variantId?: string;
  stepId?: string;
  questionId?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  timestamp: string;
  metadata?: Record<string, string>;
}

// --- A/B Testing Types ---

export interface FormVariant {
  id: string;
  formId: string;
  name: string;
  definition: FormDefinition;
  weight: number;
  active: boolean;
  createdAt: string;
}

// --- API Types ---

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T = unknown> extends ApiResponse<T[]> {
  total: number;
  page: number;
  limit: number;
}

// --- User / Org Types ---

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface Org {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
}

export interface OrgMembership {
  id: string;
  userId: string;
  orgId: string;
  role: OrgRole;
  createdAt: string;
}
