import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRole } from '../users/users.enum';
import { Users } from '../users/users.entity';
import { Course } from './courses.entity';
import { CreateCourseDto } from './dto/create-course.dto';
import { CourseResponseDto } from './dto/course-response.dto';

@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
  ) {}

  async findVisibleCourses(user: Users): Promise<CourseResponseDto[]> {
    const where =
      user.role === UserRole.TEACHER ? { teacherId: user.id } : undefined;

    const courses = await this.courseRepository.find({
      where,
      relations: {
        teacher: true,
      },
      order: {
        createdAt: 'DESC',
      },
    });

    return courses.map((course) => this.toResponseDto(course));
  }

  async createCourse(
    payload: CreateCourseDto,
    user: Users,
  ): Promise<CourseResponseDto> {
    if (user.role !== UserRole.TEACHER) {
      throw new ForbiddenException('Only teachers can create courses right now.');
    }

    const course = this.courseRepository.create({
      title: payload.title.trim(),
      description: payload.description?.trim() || null,
      teacherId: user.id,
      teacher: user,
    });

    const savedCourse = await this.courseRepository.save(course);

    return this.toResponseDto(savedCourse);
  }

  async findVisibleCourseById(
    courseId: number,
    user: Users,
  ): Promise<CourseResponseDto> {
    const course = await this.courseRepository.findOne({
      where: { id: courseId },
      relations: {
        teacher: true,
      },
    });

    if (!course) {
      throw new NotFoundException('Course was not found.');
    }

    this.ensureCourseVisibility(course, user);

    return this.toResponseDto(course);
  }

  async findTeacherOwnedCourse(courseId: number, user: Users): Promise<Course> {
    const course = await this.courseRepository.findOne({
      where: { id: courseId },
      relations: {
        teacher: true,
      },
    });

    if (!course) {
      throw new NotFoundException('Course was not found.');
    }

    if (user.role !== UserRole.TEACHER || course.teacherId !== user.id) {
      throw new ForbiddenException(
        'You can manage homework only inside your own courses.',
      );
    }

    return course;
  }

  ensureCourseVisibility(course: Course, user: Users): void {
    if (user.role === UserRole.TEACHER && course.teacherId !== user.id) {
      throw new ForbiddenException('This course is not available for your account.');
    }
  }

  toResponseDto(course: Course): CourseResponseDto {
    return {
      id: course.id,
      title: course.title,
      description: course.description,
      teacherId: course.teacherId,
      teacherName: course.teacher.fullName,
      createdAt: course.createdAt,
    };
  }
}
