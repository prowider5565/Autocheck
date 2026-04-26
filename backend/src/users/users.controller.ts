import {
  Body,
  Controller,
  Get,
  HttpCode,
  Logger,
  Patch,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import type { SignOptions } from 'jsonwebtoken';
import type { Profile } from 'passport-google-oauth20';
import { appConfigFactory } from '../config/app.config';
import { CurrentUser } from './decorators/current-user.decorator';
import { AuthResponseDto } from './dto/auth-response.dto';
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
  private readonly logger = new Logger(UsersController.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  @Post('auth/register')
  async register(
    @Body() payload: RegisterDto,
  ): Promise<AuthResponseDto> {
    const profile = await this.usersService.register(payload);

    return this.buildAuthResponse(profile, {
      sub: profile.id,
      role: profile.role,
    });
  }

  @Post('auth/login')
  @HttpCode(200)
  async login(
    @Body() payload: LoginDto,
  ): Promise<AuthResponseDto> {
    const user = await this.usersService.validateCredentials(payload);
    const profile = this.usersService.toProfileDto(user);

    return this.buildAuthResponse(profile, {
      sub: user.id,
      role: user.role,
    });
  }

  @Get('auth/google')
  @UseGuards(GoogleAuthGuard)
  startGoogleAuth(@Req() request: Request): void {
    this.logAuthEvent(
      `Starting Google OAuth flow from ${this.getRequestSource(request)}`,
    );
  }

  @Get('auth/google/callback')
  @UseGuards(GoogleAuthGuard)
  async handleGoogleCallback(
    @Req() request: GoogleRequest,
    @Res() response: Response,
  ): Promise<void> {
    this.logAuthEvent(
      `Received Google OAuth callback with code=${this.hasQueryParam(request, 'code')} error=${this.hasQueryParam(request, 'error')}`,
    );

    const googleEmail = this.usersService.ensureGoogleEmail(
      request.user?.emails?.[0]?.value,
    );
    const frontendUrl =
      appConfigFactory(this.configService).frontendUrl.replace(/\/$/, '');
    const redirectTarget = await this.usersService.getGoogleRedirect(googleEmail);

    this.logAuthEvent(
      `Google OAuth callback resolved for ${this.maskEmail(googleEmail)} with redirect target ${redirectTarget}`,
    );

    if (redirectTarget === 'signup') {
      this.logAuthEvent(
        `Redirecting ${this.maskEmail(googleEmail)} to frontend signup`,
      );
      response.redirect(
        `${frontendUrl}/signup?email=${encodeURIComponent(googleEmail)}&google=1`,
      );
      return;
    }

    const user = await this.usersService.findByEmail(googleEmail);

    if (!user) {
      throw new UnauthorizedException('Google account could not be resolved.');
    }

    const accessToken = this.signToken({
      sub: user.id,
      role: user.role,
    });

    this.logAuthEvent(
      `Redirecting ${this.maskEmail(googleEmail)} to frontend dashboard with bearer token`,
    );
    response.redirect(this.buildFrontendRedirect(`${frontendUrl}/dashboard/courses`, accessToken));
  }

  @Post('auth/logout')
  @HttpCode(200)
  logout() {
    this.logAuthEvent('Logout request acknowledged for bearer-token session');
    return { success: true };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
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
  @ApiBearerAuth()
  updateProfile(
    @CurrentUser() user: Users,
    @Body() payload: UpdateProfileDto,
  ): Promise<ProfileDto> {
    return this.usersService.updateProfile(user.id, payload);
  }

  private buildAuthResponse(
    profile: ProfileDto,
    payload: JwtPayload,
  ): AuthResponseDto {
    return {
      accessToken: this.signToken(payload),
      profile,
    };
  }

  private signToken(payload: JwtPayload): string {
    const appConfig = appConfigFactory(this.configService);

    return this.jwtService.sign(payload, {
      secret: appConfig.jwtSecret,
      expiresIn: appConfig.jwtExpiresIn as SignOptions['expiresIn'],
    });
  }

  private logAuthEvent(message: string) {
    if (!appConfigFactory(this.configService).authLoggingEnabled) {
      return;
    }

    this.logger.log(message);
  }

  private maskEmail(email?: string): string {
    if (!email) {
      return 'unknown-email';
    }

    const [localPart, domain] = email.split('@');

    if (!domain) {
      return 'invalid-email';
    }

    return `${localPart.slice(0, 2)}***@${domain}`;
  }

  private hasQueryParam(request: Request, key: string): boolean {
    return request.query[key] != null;
  }

  private getRequestSource(request: Request): string {
    const origin = request.get('origin');
    const referer = request.get('referer');

    return origin ?? referer ?? 'unknown-source';
  }

  private buildFrontendRedirect(targetUrl: string, accessToken: string): string {
    const url = new URL(targetUrl);
    url.searchParams.set('token', accessToken);

    return url.toString();
  }
}
