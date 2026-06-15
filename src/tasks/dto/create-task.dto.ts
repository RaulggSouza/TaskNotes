import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateTaskDto {
  @ApiProperty({
    description: 'Task title.',
    example: 'Write API documentation',
  })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiPropertyOptional({
    description: 'Additional task details.',
    example: 'Expose the OpenAPI reference with Scalar.',
  })
  @IsString()
  @IsOptional()
  description?: string;
}
