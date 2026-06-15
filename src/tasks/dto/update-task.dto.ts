import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateTaskDto {
  @ApiPropertyOptional({
    description: 'Task title.',
    example: 'Review API documentation',
  })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({
    description: 'Additional task details.',
    example: 'Check generated OpenAPI schema.',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Task completion status.',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  done?: boolean;
}
