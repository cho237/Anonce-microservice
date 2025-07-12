// user-response.dto.ts
import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({ example: 'b4a1f830-1234-4567-890a-bcc09d33c1a1' })
  @Expose()
  id: string;

  @ApiProperty({ example: 'Jane Doe' })
  @Expose()
  name: string;

  @ApiProperty({ example: 'jane@example.com' })
  @Expose()
  email: string;

  @ApiProperty({ example: 'USER', enum: ['USER', 'ADMIN'] })
  @Expose()
  role: string;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  @Expose()
  createdAt: Date;
}
