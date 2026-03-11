import { IsString, MinLength } from 'class-validator';

export class RequestDomainDto {
  @IsString()
  orgId!: string;

  @IsString()
  @MinLength(3)
  domain!: string;
}
