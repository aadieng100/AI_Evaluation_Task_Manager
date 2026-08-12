import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { EvaluationsService } from './evaluations.service';
import { CreateEvaluationDto } from './dto/create-evaluation.dto';

@ApiTags('evaluations')
@Controller('evaluations')
export class EvaluationsController {
  constructor(private readonly evaluationsService: EvaluationsService) {}

  @Get()
  @ApiOperation({ summary: 'List all submitted AI model evaluation results' })
  findAll() {
    return this.evaluationsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get detailed submission report for an evaluation' })
  findOne(@Param('id') id: string) {
    return this.evaluationsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Submit an AI model output evaluation (marks task COMPLETED)' })
  @ApiResponse({ status: 201, description: 'Evaluation submitted successfully' })
  create(@Body() dto: CreateEvaluationDto) {
    return this.evaluationsService.create(dto);
  }
}
