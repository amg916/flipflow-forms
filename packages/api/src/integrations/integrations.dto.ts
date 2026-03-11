import { IsString, IsIn, IsObject, IsOptional, IsBoolean } from 'class-validator';

export class CreateIntegrationDto {
  @IsString()
  orgId!: string;

  @IsIn(['crm', 'lead_distribution'])
  type!: 'crm' | 'lead_distribution';

  @IsIn(['hubspot', 'salesforce', 'leadspedia', 'cake'])
  provider!: 'hubspot' | 'salesforce' | 'leadspedia' | 'cake';

  @IsObject()
  config!: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  credentials?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  fieldMapping?: Record<string, unknown>;
}

export class UpdateIntegrationDto {
  @IsOptional()
  @IsObject()
  config?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  credentials?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  fieldMapping?: Record<string, unknown>;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
