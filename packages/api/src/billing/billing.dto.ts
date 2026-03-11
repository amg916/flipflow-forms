import { IsString } from 'class-validator';

export class CreateCheckoutDto {
  @IsString()
  orgId!: string;

  @IsString()
  priceId!: string;

  @IsString()
  successUrl!: string;

  @IsString()
  cancelUrl!: string;
}
