import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HomeworksService } from '../homeworks/homeworks.service';
import { EvaluationMode } from '../users/evaluation-mode.enum';
import { Users } from '../users/users.entity';
import { UserRole } from '../users/users.enum';
import { EvaluationService } from '../evaluation/evaluation.service';
import {
  Assignment,
  AssignmentStatus,
} from './assignments.entity';
import { AssignmentResponseDto } from './dto/assignment-response.dto';
import { ConfirmAssignmentReviewDto } from './dto/confirm-assignment-review.dto';
import { CreateAssignmentDto } from './dto/create-assignment.dto';

@Injectable()
export class AssignmentsService {
  constructor(
    @InjectRepository(Assignment)
    private readonly assignmentRepository: Repository<Assignment>,
    private readonly homeworksService: HomeworksService,
    private readonly evaluationService: EvaluationService,
  ) {}

  async findByHomework(
    homeworkId: number,
    user: Users,
  ): Promise<AssignmentResponseDto[]> {
    const homework = await this.homeworksService.findEntityVisibleById(homeworkId, user);

    const where =
      user.role === UserRole.STUDENT
        ? { homeworkId, studentId: user.id }
        : { homeworkId };

    if (user.role !== UserRole.STUDENT && homework.course.teacherId !== user.id) {
      throw new ForbiddenException('This homework is not available for your account.');
    }

    const assignments = await this.assignmentRepository.find({
      where,
      order: {
        createdAt: 'DESC',
      },
    });

    return assignments.map((assignment) => this.toResponseDto(assignment));
  }

  async submitAssignment(
    homeworkId: number,
    payload: CreateAssignmentDto,
    user: Users,
  ): Promise<AssignmentResponseDto> {
    if (user.role !== UserRole.STUDENT) {
      throw new ForbiddenException('Only students can submit homework attempts.');
    }

    const homework = await this.homeworksService.findEntityVisibleById(homeworkId, user);
    const existingAssignments = await this.assignmentRepository.find({
      where: {
        homeworkId,
        studentId: user.id,
      },
      order: {
        attemptNumber: 'ASC',
      },
    });

    const latestAssignment = existingAssignments[existingAssignments.length - 1];

    if (existingAssignments.length >= 3) {
      throw new BadRequestException('Maximum attempts reached for this homework.');
    }

    if (latestAssignment && latestAssignment.status !== AssignmentStatus.GRADED) {
      throw new BadRequestException(
        'The previous attempt is still being processed.',
      );
    }

    const teacherEvaluationMode = homework.course.teacher.evaluationMode;
    const isAiAutomated =
      teacherEvaluationMode === EvaluationMode.AI_AUTOMATED;
    const isPartialAssisted =
      teacherEvaluationMode === EvaluationMode.PARTIAL_ASSISTED;
    const evaluation =
      isAiAutomated || isPartialAssisted
        ? await this.evaluationService.evaluateHomework({
            homeworkDescription: homework.description,
            submissionText: payload.extractedText.trim(),
          })
        : null;

    const assignment = this.assignmentRepository.create({
      homeworkId,
      studentId: user.id,
      attemptNumber: existingAssignments.length + 1,
      sourceType: payload.sourceType,
      originalText: payload.originalText?.trim() || null,
      extractedText: payload.extractedText.trim(),
      fileName: payload.fileName?.trim() || null,
      filePath: null,
      status:
        isAiAutomated ? AssignmentStatus.GRADED : AssignmentStatus.REVIEW_PENDING,
      geminiScore:
        isAiAutomated || isPartialAssisted ? evaluation?.score ?? null : null,
      geminiFeedback:
        isAiAutomated || isPartialAssisted ? evaluation?.feedback ?? null : null,
      finalScore: isAiAutomated ? evaluation?.score ?? null : null,
      finalFeedback: isAiAutomated ? evaluation?.feedback ?? null : null,
      teacherEdited: false,
    });

    const savedAssignment = await this.assignmentRepository.save(assignment);

    return this.toResponseDto(savedAssignment);
  }

  async confirmReview(
    assignmentId: number,
    payload: ConfirmAssignmentReviewDto,
    user: Users,
  ): Promise<AssignmentResponseDto> {
    if (user.role !== UserRole.TEACHER) {
      throw new ForbiddenException('Only teachers can confirm assignment reviews.');
    }

    const assignment = await this.assignmentRepository.findOne({
      where: { id: assignmentId },
      relations: {
        homework: {
          course: {
            teacher: true,
          },
        },
      },
    });

    if (!assignment) {
      throw new NotFoundException('Assignment was not found.');
    }

    if (assignment.homework.course.teacherId !== user.id) {
      throw new ForbiddenException('This assignment is not available for your account.');
    }

    if (assignment.status !== AssignmentStatus.REVIEW_PENDING) {
      throw new BadRequestException(
        'Only review-pending assignments can be confirmed.',
      );
    }

    assignment.status = AssignmentStatus.GRADED;
    assignment.finalScore = Number(payload.finalScore.toFixed(1));
    assignment.finalFeedback = this.trimToSixtyWords(payload.finalFeedback);
    assignment.teacherEdited =
      assignment.finalScore !== assignment.geminiScore ||
      assignment.finalFeedback !== assignment.geminiFeedback;

    const savedAssignment = await this.assignmentRepository.save(assignment);

    return this.toResponseDto(savedAssignment);
  }

  async findVisibleById(
    assignmentId: number,
    user: Users,
  ): Promise<AssignmentResponseDto> {
    const assignment = await this.assignmentRepository.findOne({
      where: { id: assignmentId },
      relations: {
        homework: {
          course: {
            teacher: true,
          },
        },
      },
    });

    if (!assignment) {
      throw new NotFoundException('Assignment was not found.');
    }

    if (user.role === UserRole.STUDENT && assignment.studentId !== user.id) {
      throw new ForbiddenException('This assignment is not available for your account.');
    }

    if (
      user.role === UserRole.TEACHER &&
      assignment.homework.course.teacherId !== user.id
    ) {
      throw new ForbiddenException('This assignment is not available for your account.');
    }

    return this.toResponseDto(assignment);
  }

  private toResponseDto(assignment: Assignment): AssignmentResponseDto {
    return {
      id: assignment.id,
      homeworkId: assignment.homeworkId,
      studentId: assignment.studentId,
      attemptNumber: assignment.attemptNumber,
      sourceType: assignment.sourceType,
      status: assignment.status,
      submittedAt: assignment.createdAt,
      extractedText: assignment.extractedText,
      fileName: assignment.fileName,
      originalText: assignment.originalText,
      geminiScore: assignment.geminiScore,
      geminiFeedback: assignment.geminiFeedback,
      finalScore: assignment.finalScore,
      finalFeedback: assignment.finalFeedback,
      teacherEdited: assignment.teacherEdited,
    };
  }

  private trimToSixtyWords(text: string): string {
    return text.trim().split(/\s+/).filter(Boolean).slice(0, 60).join(' ');
  }
}
