import { IsNotEmpty, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignTaskDto {
  @ApiProperty({ example: 'b0a793c2-1234-4567-8901-abcdef123456', description: 'UUID of assigned evaluator' })
  @IsUUID()
  @IsNotEmpty()
  assigneeId: string;
}
