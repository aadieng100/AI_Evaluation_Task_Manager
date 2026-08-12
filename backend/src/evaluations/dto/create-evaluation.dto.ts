import { IsEnum, IsInt, IsNotEmpty, IsObject, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PreferredOutput } from '@prisma/client';

export class CreateEvaluationDto {
  @ApiProperty({ example: 'task_uuid_123', description: 'ID of evaluated task' })
  @IsUUID()
  @IsNotEmpty()
  taskId: string;

  @ApiProperty({ example: 'evaluator_uuid_456', description: 'ID of internal evaluator' })
  @IsUUID()
  @IsNotEmpty()
  evaluatorId: string;

  @ApiProperty({ enum: PreferredOutput, example: PreferredOutput.OUTPUT_A, description: 'Winning model choice' })
  @IsEnum(PreferredOutput)
  preferredOutput: PreferredOutput;

  @ApiProperty({ example: 5, description: 'Overall quality rating (1 to 5 scale)' })
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiProperty({ example: 'Model A generated clean, idiomatic code with edge case handling.', description: 'Qualitative evaluation feedback' })
  @IsString()
  @IsNotEmpty()
  feedback: string;

  @ApiPropertyOptional({
    example: { accuracy: 5, safety: 5, latencyScore: 4, conciseness: 5 },
    description: 'Dynamic JSONB evaluation metrics (e.g. accuracy, safety, latency)',
  })
  @IsObject()
  @IsOptional()
  metrics?: Record<string, any>;
}
