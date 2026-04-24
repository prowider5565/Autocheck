import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

export const databaseConfigFactory = (
    config: ConfigService,
): TypeOrmModuleOptions => ({
    type: 'postgres',
    host: config.get<string>('DB_HOST'),
    port: config.get<number>('DB_PORT'),
    username: config.get<string>('DB_USERNAME'),
    password: config.get<string>("DB_PASSWORD"),
    database: config.get<string>('DB_NAME'),
    autoLoadEntities: true,
    namingStrategy: new SnakeNamingStrategy(),
    synchronize: config.get<string>('ENVIRONMENT') === 'dev',
});
