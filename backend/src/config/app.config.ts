import { ConfigService } from '@nestjs/config';

export interface AppConfig {
  port: number;
  jwtSecret: string;
  jwtExpiresIn: string;
  authCookieName: string;
  frontendUrl: string;
  geminiApiKey: string;
  geminiModel: string;
  googleClientId: string;
  googleClientSecret: string;
  googleCallbackUrl: string;
}

export const appConfigFactory = (config: ConfigService): AppConfig => ({
  port: Number(config.get<string>('APP_PORT') ?? 3000),
  jwtSecret: config.get<string>('JWT_SECRET') ?? 'change-me',
  jwtExpiresIn: config.get<string>('JWT_EXPIRES_IN') ?? '7d',
  authCookieName: config.get<string>('AUTH_COOKIE_NAME') ?? 'autocheck_auth',
  frontendUrl: config.get<string>('FRONTEND_URL') ?? 'http://localhost:5173',
  geminiApiKey: config.get<string>('GEMINI_API_KEY') ?? '',
  geminiModel:
    config.get<string>('GEMINI_MODEL') ?? 'gemini-2.5-flash',
  googleClientId: config.get<string>('GOOGLE_CLIENT_ID') ?? '',
  googleClientSecret: config.get<string>('GOOGLE_CLIENT_SECRET') ?? '',
  googleCallbackUrl:
    config.get<string>('GOOGLE_CALLBACK_URL') ??
    'http://localhost:3000/api/users/auth/google/callback',
});
