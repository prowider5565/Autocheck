import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy, VerifyCallback } from 'passport-google-oauth20';
import { appConfigFactory } from '../../config/app.config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  private readonly logger = new Logger(GoogleStrategy.name);
  private readonly authLoggingEnabled: boolean;

  constructor(configService: ConfigService) {
    const appConfig = appConfigFactory(configService);

    super({
      clientID: appConfig.googleClientId,
      clientSecret: appConfig.googleClientSecret,
      callbackURL: appConfig.googleCallbackUrl,
      scope: ['email', 'profile'],
    });

    this.authLoggingEnabled = appConfig.authLoggingEnabled;

    if (this.authLoggingEnabled) {
      this.logger.log(
        `Google OAuth strategy initialized with callback URL ${appConfig.googleCallbackUrl}`,
      );
    }
  }

  validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): void {
    if (this.authLoggingEnabled) {
      this.logger.log(
        `Google OAuth profile validated for ${this.maskEmail(profile.emails?.[0]?.value)}`,
      );
    }

    done(null, profile);
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
}
