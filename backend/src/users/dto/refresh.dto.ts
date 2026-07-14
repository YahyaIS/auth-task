import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RefreshDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIs...', description: 'Refresh token issued at sign-in or previous refresh' })
  @IsString()
  @IsNotEmpty()
  refreshToken!: string;
}
