import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('tasks')
export class Task {
  @ApiProperty({
    description: 'Task identifier.',
    example: 1,
  })
  @PrimaryGeneratedColumn()
  id!: number;

  @ApiProperty({
    description: 'Task title.',
    example: 'Write API documentation',
  })
  @Column()
  title!: string;

  @ApiPropertyOptional({
    description: 'Additional task details.',
    example: 'Expose the OpenAPI reference with Scalar.',
    nullable: true,
  })
  @Column({ nullable: true })
  description?: string;

  @ApiProperty({
    description: 'Task completion status.',
    example: false,
  })
  @Column({ default: false })
  done!: boolean;

  @ApiProperty({
    description: 'Task creation timestamp.',
    example: '2026-06-15T12:00:00.000Z',
  })
  @CreateDateColumn()
  createdAt!: Date;

  @ApiProperty({
    description: 'Task last update timestamp.',
    example: '2026-06-15T12:30:00.000Z',
  })
  @UpdateDateColumn()
  updatedAt!: Date;
}
