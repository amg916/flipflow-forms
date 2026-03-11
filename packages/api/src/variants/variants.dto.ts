import { IsString, IsOptional, IsObject, IsNumber, IsBoolean } from 'class-validator';

export class CreateVariantDto {
  @IsString()
  formId!: string;

  @IsString()
  name!: string;

  @IsOptional()
  @IsObject()
  definition?: Record<string, unknown>;
}

export class UpdateVariantDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsObject()
  definition?: Record<string, unknown>;

  @IsOptional()
  @IsNumber()
  weight?: number;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
