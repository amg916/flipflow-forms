import { IsString, IsOptional, IsObject, IsNotEmpty } from 'class-validator';

export class CreateTemplateDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsString()
  @IsNotEmpty()
  vertical!: string;

  @IsObject()
  definition!: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  thankYouPage?: Record<string, unknown>;
}

export class UseTemplateDto {
  @IsString()
  @IsNotEmpty()
  orgId!: string;
}
