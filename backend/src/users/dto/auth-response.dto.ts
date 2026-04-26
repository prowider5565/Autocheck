import { ProfileDto } from './profile.dto';

export class AuthResponseDto {
  accessToken!: string;
  profile!: ProfileDto;
}
