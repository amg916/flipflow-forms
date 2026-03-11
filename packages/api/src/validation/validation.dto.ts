import { IsString, IsIn } from 'class-validator';

export class ValidateFieldDto {
  @IsIn(['email', 'phone'])
  type!: 'email' | 'phone';

  @IsString()
  value!: string;

  @IsString()
  orgId!: string;
}
