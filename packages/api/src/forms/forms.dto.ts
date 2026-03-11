import { IsString, IsOptional, IsObject, IsBoolean, MaxLength } from 'class-validator';
import { MAX_FORM_TITLE_LENGTH } from '@flipflow/shared';

export class CreateFormDto {
  @IsString()
  @MaxLength(MAX_FORM_TITLE_LENGTH)
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  orgId!: string;

  @IsOptional()
  @IsObject()
  definition?: Record<string, unknown>;
}

export class UpdateFormDto {
  @IsOptional()
  @IsString()
  @MaxLength(MAX_FORM_TITLE_LENGTH)
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsObject()
  definition?: Record<string, unknown>;

  @IsOptional()
  @IsBoolean()
  published?: boolean;
}

export class EvaluateStepDto {
  @IsString()
  stepId!: string;

  @IsObject()
  answers!: Record<string, string | string[]>;
}
