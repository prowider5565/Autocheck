import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../users/decorators/current-user.decorator';
import { JwtAuthGuard } from '../users/guards/jwt-auth.guard';
import { Users } from '../users/users.entity';
import { AssignmentsService } from './assignments.service';
import { AssignmentResponseDto } from './dto/assignment-response.dto';
import { CreateAssignmentDto } from './dto/create-assignment.dto';

@ApiTags('assignments')
@ApiCookieAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class AssignmentsController {
  constructor(private readonly assignmentsService: AssignmentsService) {}

  @Get('homeworks/:homeworkId/assignments')
  getHomeworkAssignments(
    @Param('homeworkId', ParseIntPipe) homeworkId: number,
    @CurrentUser() user: Users,
  ): Promise<AssignmentResponseDto[]> {
    return this.assignmentsService.findByHomework(homeworkId, user);
  }

  @Post('homeworks/:homeworkId/assignments')
  submitAssignment(
    @Param('homeworkId', ParseIntPipe) homeworkId: number,
    @Body() payload: CreateAssignmentDto,
    @CurrentUser() user: Users,
  ): Promise<AssignmentResponseDto> {
    return this.assignmentsService.submitAssignment(homeworkId, payload, user);
  }

  @Get('assignments/:id')
  getAssignment(
    @Param('id', ParseIntPipe) assignmentId: number,
    @CurrentUser() user: Users,
  ): Promise<AssignmentResponseDto> {
    return this.assignmentsService.findVisibleById(assignmentId, user);
  }
}
