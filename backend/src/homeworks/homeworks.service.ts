import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CoursesService } from '../courses/courses.service';
import { Users } from '../users/users.entity';
import { Homework } from './homeworks.entity';
import { CreateHomeworkDto } from './dto/create-homework.dto';
import { HomeworkResponseDto } from './dto/homework-response.dto';
import { UpdateHomeworkDto } from './dto/update-homework.dto';

@Injectable()
export class HomeworksService {
  constructor(
    @InjectRepository(Homework)
    private readonly homeworkRepository: Repository<Homework>,
    private readonly coursesService: CoursesService,
  ) {}

  async findByCourse(courseId: number, user: Users): Promise<HomeworkResponseDto[]> {
    await this.coursesService.findVisibleCourseById(courseId, user);

    const homeworks = await this.homeworkRepository.find({
      where: { courseId },
      order: {
        createdAt: 'DESC',
      },
    });

    return homeworks.map((homework) => this.toResponseDto(homework));
  }

  async findVisibleById(
    homeworkId: number,
    user: Users,
  ): Promise<HomeworkResponseDto> {
    const homework = await this.homeworkRepository.findOne({
      where: { id: homeworkId },
      relations: {
        course: {
          teacher: true,
        },
      },
    });

    if (!homework) {
      throw new NotFoundException('Homework was not found.');
    }

    this.coursesService.ensureCourseVisibility(homework.course, user);

    return this.toResponseDto(homework);
  }

  async findEntityVisibleById(homeworkId: number, user: Users): Promise<Homework> {
    const homework = await this.homeworkRepository.findOne({
      where: { id: homeworkId },
      relations: {
        course: {
          teacher: true,
        },
      },
    });

    if (!homework) {
      throw new NotFoundException('Homework was not found.');
    }

    this.coursesService.ensureCourseVisibility(homework.course, user);

    return homework;
  }

  async create(
    courseId: number,
    payload: CreateHomeworkDto,
    user: Users,
  ): Promise<HomeworkResponseDto> {
    const course = await this.coursesService.findTeacherOwnedCourse(courseId, user);
    const homework = this.homeworkRepository.create({
      courseId: course.id,
      description: payload.description.trim(),
    });

    const savedHomework = await this.homeworkRepository.save(homework);

    return this.toResponseDto(savedHomework);
  }

  async update(
    homeworkId: number,
    payload: UpdateHomeworkDto,
    user: Users,
  ): Promise<HomeworkResponseDto> {
    const homework = await this.findManageableHomework(homeworkId, user);

    if (payload.description !== undefined) {
      homework.description = payload.description.trim();
    }

    const savedHomework = await this.homeworkRepository.save(homework);

    return this.toResponseDto(savedHomework);
  }

  private async findManageableHomework(
    homeworkId: number,
    user: Users,
  ): Promise<Homework> {
    const homework = await this.findEntityVisibleById(homeworkId, user);

    await this.coursesService.findTeacherOwnedCourse(homework.courseId, user);

    return homework;
  }

  private toResponseDto(homework: Homework): HomeworkResponseDto {
    return {
      id: homework.id,
      courseId: homework.courseId,
      description: homework.description,
      createdAt: homework.createdAt,
    };
  }
}
