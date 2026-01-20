import { QuizQuestion, Archetype, DimensionCode } from './types';

export interface GeneratePhase1Request {
  phase: 1;
  topic: string;
}

export interface GeneratePhase2Request {
  phase: 2;
  topic: string;
  context: {
    archetypeName: string;
    archetypeVector: number[];
    targetDimensions: string[];
  };
}

export type GenerateRequest = GeneratePhase1Request | GeneratePhase2Request;

export interface ArchetypeRequest {
  answers: Partial<Record<DimensionCode, 'A' | 'B'>>;
}

export interface ArchetypeResponse {
  archetype: Archetype;
  targetDimensions: DimensionCode[];
}

export interface GenerateProfileRequest {
  baseArchetype: string;
  finalVector: number[];
}

export interface ProfileResponse {
  label_final: string;
  definition_longue: string;
}

class QuizApiClient {
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  async generateQuestions(request: GenerateRequest): Promise<QuizQuestion[]> {
    try {
      const response = await fetch('/api/quiz/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      return this.handleResponse<QuizQuestion[]>(response);
    } catch (error) {
      console.error('QuizApiClient.generateQuestions error:', error);
      throw error;
    }
  }

  async identifyArchetype(request: ArchetypeRequest): Promise<ArchetypeResponse> {
    try {
      const response = await fetch('/api/quiz/archetype', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      return this.handleResponse<ArchetypeResponse>(response);
    } catch (error) {
      console.error('QuizApiClient.identifyArchetype error:', error);
      throw error;
    }
  }

  async generateProfile(request: GenerateProfileRequest): Promise<ProfileResponse> {
    try {
      const response = await fetch('/api/quiz/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      return this.handleResponse<ProfileResponse>(response);
    } catch (error) {
      console.error('QuizApiClient.generateProfile error:', error);
      throw error;
    }
  }
}

export const quizApiClient = new QuizApiClient();
