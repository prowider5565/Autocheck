import {
  BadGatewayException,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { appConfigFactory } from '../config/app.config';

interface GeminiGenerateContentResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
}

export interface HomeworkEvaluationResult {
  score: number;
  feedback: string;
}

@Injectable()
export class EvaluationService {
  constructor(private readonly configService: ConfigService) {}

  async evaluateHomework(input: {
    homeworkDescription: string;
    submissionText: string;
  }): Promise<HomeworkEvaluationResult> {
    const appConfig = appConfigFactory(this.configService);

    if (!appConfig.geminiApiKey) {
      throw new ServiceUnavailableException(
        'Gemini integration is not configured. Set GEMINI_API_KEY in backend/.env.',
      );
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${appConfig.geminiModel}:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': appConfig.geminiApiKey,
        },
        body: JSON.stringify({
          system_instruction: {
            parts: [
              {
                text: [
                  'You are a strict homework evaluator.',
                  'Return JSON only.',
                  'The JSON object must contain exactly two keys: score and feedback.',
                  'score must be a number from 1 to 10.',
                  'feedback must be written in Uzbek (Latin script).',
                  'feedback must be brief, helpful, and no more than 60 words.',
                ].join(' '),
              },
            ],
          },
          contents: [
            {
              parts: [
                {
                  text: [
                    'Evaluate the following student homework submission.',
                    '',
                    'Homework description:',
                    input.homeworkDescription,
                    '',
                    'Student submission:',
                    input.submissionText,
                    '',
                    'Important: write the feedback in Uzbek only.',
                    '',
                    'Return only valid JSON in this format:',
                    '{"score": 1, "feedback": "Qisqa va foydali izoh"}',
                  ].join('\n'),
                },
              ],
            },
          ],
          generationConfig: {
            responseMimeType: 'application/json',
          },
        }),
      },
    );

    if (!response.ok) {
      throw new BadGatewayException('Gemini request failed.');
    }

    const body =
      (await response.json()) as GeminiGenerateContentResponse;
    const rawText = body.candidates?.[0]?.content?.parts
      ?.map((part) => part.text ?? '')
      .join('')
      .trim();

    if (!rawText) {
      throw new BadGatewayException('Gemini returned an empty response.');
    }

    let parsed: unknown;

    try {
      parsed = JSON.parse(rawText);
    } catch {
      throw new BadGatewayException('Gemini returned invalid JSON.');
    }

    const score =
      typeof parsed === 'object' && parsed !== null && 'score' in parsed
        ? Number((parsed as { score: unknown }).score)
        : Number.NaN;
    const feedback =
      typeof parsed === 'object' && parsed !== null && 'feedback' in parsed
        ? String((parsed as { feedback: unknown }).feedback ?? '')
        : '';

    if (Number.isNaN(score) || score < 1 || score > 10) {
      throw new BadGatewayException(
        'Gemini returned a score outside the required 1-10 range.',
      );
    }

    return {
      score: Number(score.toFixed(1)),
      feedback: this.trimToSixtyWords(feedback),
    };
  }

  private trimToSixtyWords(text: string): string {
    return text.trim().split(/\s+/).filter(Boolean).slice(0, 60).join(' ');
  }
}
