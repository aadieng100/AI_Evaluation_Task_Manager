import { IsEmail, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';

export class CreateUserDto {
  @ApiProperty({ example: 'evaluator.alex@micro1.ai', description: 'Internal user email' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'Alex Evaluator', description: 'Internal user full name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ enum: Role, default: Role.EVALUATOR, description: 'Role within internal platform' })
  @IsEnum(Role)
  role: Role;
}
