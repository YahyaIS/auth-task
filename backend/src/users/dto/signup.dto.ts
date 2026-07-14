import { IsEmail, IsString, MinLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SignupDto {
  @ApiProperty({ example: 'user@example.com', description: 'User email address' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'John Doe', description: 'User full name' })
  @IsString()
  @MinLength(3)
  name!: string;

  @ApiProperty({
    example: 'Password123!',
    description: 'At least 8 characters with one letter, one number, and one special character',
  })
  @IsString()
  @MinLength(8)
  @Matches(
    /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/,
    {
      message:
        'Password must be at least 8 characters and contain at least one letter, one number, and one special character.',
    },
  )
  password!: string;
}
