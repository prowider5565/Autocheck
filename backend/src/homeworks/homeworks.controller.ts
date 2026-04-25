import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../users/decorators/current-user.decorator';
import { JwtAuthGuard } from '../users/guards/jwt-auth.guard';
import { Users } from '../users/users.entity';
import { CreateHomeworkDto } from './dto/create-homework.dto';
import { HomeworkResponseDto } from './dto/homework-response.dto';
import { UpdateHomeworkDto } from './dto/update-homework.dto';
import { HomeworksService } from './homeworks.service';

@ApiTags('homeworks')
@ApiCookieAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class HomeworksController {
  constructor(private readonly homeworksService: HomeworksService) {}

  @Get('courses/:courseId/homeworks')
  getCourseHomeworks(
    @Param('courseId', ParseIntPipe) courseId: number,
    @CurrentUser() user: Users,
  ): Promise<HomeworkResponseDto[]> {
    return this.homeworksService.findByCourse(courseId, user);
  }

  @Get('homeworks/:id')
  getHomework(
    @Param('id', ParseIntPipe) homeworkId: number,
    @CurrentUser() user: Users,
  ): Promise<HomeworkResponseDto> {
    return this.homeworksService.findVisibleById(homeworkId, user);
  }

  @Post('courses/:courseId/homeworks')
  createHomework(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Body() payload: CreateHomeworkDto,
    @CurrentUser() user: Users,
  ): Promise<HomeworkResponseDto> {
    return this.homeworksService.create(courseId, payload, user);
  }

  @Patch('homeworks/:id')
  updateHomework(
    @Param('id', ParseIntPipe) homeworkId: number,
    @Body() payload: UpdateHomeworkDto,
    @CurrentUser() user: Users,
  ): Promise<HomeworkResponseDto> {
    return this.homeworksService.update(homeworkId, payload, user);
  }
}
