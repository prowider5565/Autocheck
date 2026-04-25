import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EvaluationModule } from '../evaluation/evaluation.module';
import { HomeworksModule } from '../homeworks/homeworks.module';
import { Assignment } from './assignments.entity';
import { AssignmentsController } from './assignments.controller';
import { AssignmentsService } from './assignments.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Assignment]),
    HomeworksModule,
    EvaluationModule,
  ],
  controllers: [AssignmentsController],
  providers: [AssignmentsService],
  exports: [TypeOrmModule, AssignmentsService],
})
export class AssignmentsModule {}
