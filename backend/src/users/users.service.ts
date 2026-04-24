import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { EvaluationMode } from './evaluation-mode.enum';
import { LoginDto } from './dto/login.dto';
import { ProfileDto, StudentProfileDto, TeacherProfileDto } from './dto/profile.dto';
import { RegisterDto } from './dto/register.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UserRole } from './users.enum';
import { Users } from './users.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Users)
    private readonly userRepository: Repository<Users>,
  ) {}

  async register(payload: RegisterDto): Promise<ProfileDto> {
    if (![UserRole.STUDENT, UserRole.TEACHER].includes(payload.role)) {
      throw new BadRequestException('Only students and teachers can register.');
    }

    await this.ensureEmailIsAvailable(payload.email);

    const password = await bcrypt.hash(payload.password, 10);
    const user = this.userRepository.create({
      email: payload.email.trim().toLowerCase(),
      fullName: payload.fullName.trim(),
      password,
      role: payload.role,
      evaluationMode: EvaluationMode.AI_AUTOMATED,
    });

    const savedUser = await this.userRepository.save(user);

    return this.toProfileDto(savedUser);
  }

  async validateCredentials(payload: LoginDto): Promise<Users> {
    const user = await this.userRepository.findOne({
      where: {
        email: payload.email.trim().toLowerCase(),
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const isPasswordValid = await bcrypt.compare(payload.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    return user;
  }

  async findByIdOrFail(id: number): Promise<Users> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new UnauthorizedException('Authenticated user was not found.');
    }

    return user;
  }

  async findByEmail(email: string): Promise<Users | null> {
    return this.userRepository.findOne({
      where: {
        email: email.trim().toLowerCase(),
      },
    });
  }

  async updateProfile(userId: number, payload: UpdateProfileDto): Promise<ProfileDto> {
    const user = await this.findByIdOrFail(userId);

    if (payload.email && payload.email.trim().toLowerCase() !== user.email) {
      await this.ensureEmailIsAvailable(payload.email, user.id);
      user.email = payload.email.trim().toLowerCase();
    }

    if (typeof payload.fullName === 'string' && payload.fullName.trim()) {
      user.fullName = payload.fullName.trim();
    }

    if (payload.password) {
      user.password = await bcrypt.hash(payload.password, 10);
    }

    if (payload.evaluationMode) {
      if (user.role !== UserRole.TEACHER) {
        throw new BadRequestException(
          'Evaluation mode can only be updated by teachers.',
        );
      }

      user.evaluationMode = payload.evaluationMode;
    }

    const savedUser = await this.userRepository.save(user);

    return this.toProfileDto(savedUser);
  }

  toProfileDto(user: Users): ProfileDto {
    if (user.role === UserRole.TEACHER) {
      const teacherProfile = new TeacherProfileDto();
      teacherProfile.id = user.id;
      teacherProfile.fullName = user.fullName;
      teacherProfile.email = user.email;
      teacherProfile.role = UserRole.TEACHER;
      teacherProfile.evaluationMode = user.evaluationMode;
      teacherProfile.createdAt = user.createdAt;

      return teacherProfile;
    }

    const studentProfile = new StudentProfileDto();
    studentProfile.id = user.id;
    studentProfile.fullName = user.fullName;
    studentProfile.email = user.email;
    studentProfile.role = UserRole.STUDENT;
    studentProfile.createdAt = user.createdAt;

    return studentProfile;
  }

  private async ensureEmailIsAvailable(
    email: string,
    currentUserId?: number,
  ): Promise<void> {
    const existingUser = await this.findByEmail(email);

    if (!existingUser) {
      return;
    }

    if (currentUserId && existingUser.id === currentUserId) {
      return;
    }

    throw new ConflictException('Email is already in use.');
  }

  async findProfileById(userId: number): Promise<ProfileDto> {
    const user = await this.findByIdOrFail(userId);

    return this.toProfileDto(user);
  }

  async getGoogleRedirect(email: string): Promise<string> {
    const user = await this.findByEmail(email);

    if (user) {
      return 'login';
    }

    return 'signup';
  }

  ensureGoogleEmail(profileEmail?: string): string {
    if (!profileEmail) {
      throw new NotFoundException('Google profile email was not provided.');
    }

    return profileEmail.trim().toLowerCase();
  }
}
