import { IsEmail, IsNotEmpty, IsString, MinLength, MaxLength } from 'class-validator';
import { PASSWORD_MIN_LENGTH, PASSWORD_MAX_LENGTH } from '@flipflow/shared';

export class SignupDto {
  @IsEmail()
  email!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @MinLength(PASSWORD_MIN_LENGTH)
  @MaxLength(PASSWORD_MAX_LENGTH)
  password!: string;
}

export class LoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;
}
