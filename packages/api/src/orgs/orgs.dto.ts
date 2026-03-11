import { IsString, IsNotEmpty, IsEmail, IsOptional, IsIn } from 'class-validator';

export class CreateOrgDto {
  @IsString()
  @IsNotEmpty()
  name!: string;
}

export class UpdateOrgDto {
  @IsString()
  @IsOptional()
  name?: string;
}

export class InviteMemberDto {
  @IsEmail()
  email!: string;

  @IsString()
  @IsOptional()
  @IsIn(['owner', 'admin', 'editor', 'analyst'])
  role?: string = 'editor';
}

export class AcceptInviteDto {
  @IsString()
  @IsNotEmpty()
  token!: string;
}
