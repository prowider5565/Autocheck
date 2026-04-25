import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseConfigFactory } from './config/database.config';
import { CoursesModule } from './courses/courses.module';
import { HomeworksModule } from './homeworks/homeworks.module';
import { AssignmentsModule } from './assignments/assignments.module';
import { EvaluationModule } from './evaluation/evaluation.module';


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: ['.env'] }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: databaseConfigFactory
    }),
    UsersModule,
    CoursesModule,
    HomeworksModule,
    AssignmentsModule,
    EvaluationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
