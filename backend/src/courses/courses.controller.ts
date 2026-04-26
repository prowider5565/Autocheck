import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../users/decorators/current-user.decorator';
import { JwtAuthGuard } from '../users/guards/jwt-auth.guard';
import { Users } from '../users/users.entity';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { CourseResponseDto } from './dto/course-response.dto';
import { UpdateCourseArchiveDto } from './dto/update-course-archive.dto';

@ApiTags('courses')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get()
  getCourses(@CurrentUser() user: Users): Promise<CourseResponseDto[]> {
    return this.coursesService.findVisibleCourses(user);
  }

  @Post()
  createCourse(
    @Body() payload: CreateCourseDto,
    @CurrentUser() user: Users,
  ): Promise<CourseResponseDto> {
    return this.coursesService.createCourse(payload, user);
  }

  @Get(':id')
  getCourse(
    @Param('id', ParseIntPipe) courseId: number,
    @CurrentUser() user: Users,
  ): Promise<CourseResponseDto> {
    return this.coursesService.findVisibleCourseById(courseId, user);
  }

  @Patch(':id/archive')
  updateArchiveStatus(
    @Param('id', ParseIntPipe) courseId: number,
    @Body() payload: UpdateCourseArchiveDto,
    @CurrentUser() user: Users,
  ): Promise<CourseResponseDto> {
    return this.coursesService.updateArchiveStatus(
      courseId,
      payload.isArchived,
      user,
    );
  }
}
