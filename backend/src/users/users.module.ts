import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from './users.entity';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/jwt.strategy';
import { GoogleStrategy } from './strategies/google.strategy';

@Module({
  imports: [TypeOrmModule.forFeature([Users]), PassportModule, JwtModule.register({})],
  controllers: [UsersController],
  providers: [UsersService, JwtStrategy, GoogleStrategy],
  exports: [UsersService],
})
export class UsersModule { }
