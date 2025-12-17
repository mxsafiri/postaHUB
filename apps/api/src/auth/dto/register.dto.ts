import { IsOptional, IsString, Matches, MinLength } from 'class-validator';

export class RegisterDto {
  @IsString()
  phone!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsOptional()
  @IsString()
  displayName?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{20}$/)
  nidaNumber?: string;
}
