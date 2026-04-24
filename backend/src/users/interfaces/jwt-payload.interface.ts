import { UserRole } from '../users.enum';

export interface JwtPayload {
  sub: number;
  role: UserRole;
}
