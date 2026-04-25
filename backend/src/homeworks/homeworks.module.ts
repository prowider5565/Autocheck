import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoursesModule } from '../courses/courses.module';
import { EvaluationModule } from '../evaluation/evaluation.module';
import { Homework } from './homeworks.entity';
import { HomeworksController } from './homeworks.controller';
import { HomeworksService } from './homeworks.service';

@Module({
  imports: [TypeOrmModule.forFeature([Homework]), CoursesModule, EvaluationModule],
  controllers: [HomeworksController],
  providers: [HomeworksService],
  exports: [HomeworksService, TypeOrmModule],
})
export class HomeworksModule {}
