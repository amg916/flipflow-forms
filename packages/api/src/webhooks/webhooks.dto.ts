import { IsString, IsOptional, IsUrl, IsObject, IsBoolean } from 'class-validator';

export class CreateWebhookDto {
  @IsString()
  orgId!: string;

  @IsOptional()
  @IsString()
  formId?: string;

  @IsString()
  name!: string;

  @IsUrl()
  url!: string;

  @IsOptional()
  @IsString()
  method?: string;

  @IsOptional()
  @IsObject()
  headers?: Record<string, string>;

  @IsOptional()
  @IsObject()
  fieldMapping?: Record<string, string>;

  @IsOptional()
  @IsObject()
  retryPolicy?: Record<string, unknown>;
}

export class UpdateWebhookDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsUrl()
  url?: string;

  @IsOptional()
  @IsString()
  method?: string;

  @IsOptional()
  @IsObject()
  headers?: Record<string, string>;

  @IsOptional()
  @IsObject()
  fieldMapping?: Record<string, string>;

  @IsOptional()
  @IsObject()
  retryPolicy?: Record<string, unknown>;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
