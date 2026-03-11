import { IsString, IsOptional, IsObject, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class TrackEventDto {
  @IsString()
  type!: string;

  @IsString()
  formId!: string;

  @IsString()
  sessionId!: string;

  @IsOptional()
  @IsString()
  variantId?: string;

  @IsOptional()
  @IsString()
  stepId?: string;

  @IsOptional()
  @IsString()
  questionId?: string;

  @IsOptional()
  @IsString()
  utmSource?: string;

  @IsOptional()
  @IsString()
  utmMedium?: string;

  @IsOptional()
  @IsString()
  utmCampaign?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}

export class TrackBatchDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TrackEventDto)
  events!: TrackEventDto[];
}
