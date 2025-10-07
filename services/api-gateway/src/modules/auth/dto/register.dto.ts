import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, IsPhoneNumber } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  name: string;

  @ApiProperty({ example: '+27821234567' })
  @IsPhoneNumber('ZA')
  phone: string;

  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123', minLength: 8 })
  @IsString()
  @MinLength(8)
  password: string;
}