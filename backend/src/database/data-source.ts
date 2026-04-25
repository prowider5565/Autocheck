import 'dotenv/config';
import { join } from 'path';
import { DataSource } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { Assignment } from '../assignments/assignments.entity';
import { Course } from '../courses/courses.entity';
import { Homework } from '../homeworks/homeworks.entity';
import { Users } from '../users/users.entity';

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 5432),
  username: process.env.DB_USERNAME ?? 'postgres',
  password: process.env.DB_PASSWORD ?? '',
  database: process.env.DB_NAME ?? 'autocheck',
  namingStrategy: new SnakeNamingStrategy(),
  synchronize: false,
  entities: [Users, Course, Homework, Assignment],
  migrations: [join(__dirname, 'migrations', '*{.ts,.js}')],
});

export default dataSource;
