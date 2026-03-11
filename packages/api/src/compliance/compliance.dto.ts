import { IsString, IsOptional } from 'class-validator';

export class SubmitConsentDto {
  @IsString()
  formId!: string;

  @IsString()
  submissionId!: string;

  @IsString()
  consentText!: string;

  @IsString()
  consentTimestamp!: string;

  @IsString()
  ip!: string;

  @IsString()
  userAgent!: string;

  @IsOptional()
  @IsString()
  trustedFormCertUrl?: string;

  @IsOptional()
  @IsString()
  jornayaToken?: string;
}

export class ExportComplianceDto {
  @IsString()
  formId!: string;

  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;
}
