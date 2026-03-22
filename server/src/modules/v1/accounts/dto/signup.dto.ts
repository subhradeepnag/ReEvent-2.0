import { IsEmail, IsNotEmpty, IsString, IsPhoneNumber, MinLength, IsOptional } from 'class-validator'

export class SignupDto {
  @IsNotEmpty()
  @IsString()
  name: string

  @IsNotEmpty()
  @IsPhoneNumber()
  phone: string

  @IsNotEmpty()
  @IsEmail()
  email: string

  @IsNotEmpty()
  @MinLength(6)
  password: string

  @IsOptional()
  avatar?: string
}
