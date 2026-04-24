import {
  Body,
  Controller,
  Get,
  HttpCode,
  Patch,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { ApiCookieAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import type { SignOptions } from 'jsonwebtoken';
import type { Profile } from 'passport-google-oauth20';
import { appConfigFactory } from '../config/app.config';
import { CurrentUser } from './decorators/current-user.decorator';
import { LoginDto } from './dto/login.dto';
import { ProfileDto, StudentProfileDto, TeacherProfileDto } from './dto/profile.dto';
import { RegisterDto } from './dto/register.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { Users } from './users.entity';
import { UsersService } from './users.service';

interface GoogleRequest extends Request {
  user?: Profile;
}

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  @Post('auth/register')
  async register(
    @Body() payload: RegisterDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<ProfileDto> {
    const profile = await this.usersService.register(payload);

    this.setAuthCookie(response, {
      sub: profile.id,
      role: profile.role,
    });

    return profile;
  }

  @Post('auth/login')
  @HttpCode(200)
  async login(
    @Body() payload: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<ProfileDto> {
    const user = await this.usersService.validateCredentials(payload);
    const profile = this.usersService.toProfileDto(user);

    this.setAuthCookie(response, {
      sub: user.id,
      role: user.role,
    });

    return profile;
  }

  @Get('auth/google')
  @UseGuards(GoogleAuthGuard)
  startGoogleAuth(): void {}

  @Get('auth/google/callback')
  @UseGuards(GoogleAuthGuard)
  async handleGoogleCallback(
    @Req() request: GoogleRequest,
    @Res() response: Response,
  ): Promise<void> {
    const googleEmail = this.usersService.ensureGoogleEmail(
      request.user?.emails?.[0]?.value,
    );
    const frontendUrl =
      appConfigFactory(this.configService).frontendUrl.replace(/\/$/, '');
    const redirectTarget = await this.usersService.getGoogleRedirect(googleEmail);

    if (redirectTarget === 'signup') {
      response.redirect(
        `${frontendUrl}/signup?email=${encodeURIComponent(googleEmail)}&google=1`,
      );
      return;
    }

    const user = await this.usersService.findByEmail(googleEmail);

    if (!user) {
      throw new UnauthorizedException('Google account could not be resolved.');
    }

    this.setAuthCookie(response, {
      sub: user.id,
      role: user.role,
    });

    response.redirect(`${frontendUrl}/dashboard/courses`);
  }

  @Post('auth/logout')
  @HttpCode(200)
  logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie(appConfigFactory(this.configService).authCookieName, {
      httpOnly: true,
      sameSite: 'lax',
    });

    return { success: true };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth()
  @ApiOkResponse({
    schema: {
      oneOf: [
        { $ref: '#/components/schemas/StudentProfileDto' },
        { $ref: '#/components/schemas/TeacherProfileDto' },
      ],
    },
  })
  getProfile(@CurrentUser() user: Users): Promise<ProfileDto> {
    return this.usersService.findProfileById(user.id);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth()
  updateProfile(
    @CurrentUser() user: Users,
    @Body() payload: UpdateProfileDto,
  ): Promise<ProfileDto> {
    return this.usersService.updateProfile(user.id, payload);
  }

  private setAuthCookie(response: Response, payload: JwtPayload) {
    const appConfig = appConfigFactory(this.configService);
    const token = this.jwtService.sign(payload, {
      secret: appConfig.jwtSecret,
      expiresIn: appConfig.jwtExpiresIn as SignOptions['expiresIn'],
    });

    response.cookie(appConfig.authCookieName, token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      path: '/',
    });
  }
}
