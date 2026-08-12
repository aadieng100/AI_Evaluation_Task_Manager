import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'List all internal platform users and evaluators' })
  @ApiResponse({ status: 200, description: 'List of users with task counts' })
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get details of a specific user/evaluator' })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Register a new internal evaluator or admin' })
  @ApiResponse({ status: 201, description: 'User successfully created' })
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }
}
