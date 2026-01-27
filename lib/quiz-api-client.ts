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
    if (response.ok) {
      return response.json();
    } else {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        if (errorData.error) {
          errorMessage = typeof errorData.error === 'object' ? JSON.stringify(errorData.error) : errorData.error;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
      } catch (e) {
        // Not a JSON response, try to get text
        try {
          const textError = await response.text();
          if (textError) {
            errorMessage = textError.substring(0, 500); // Truncate long HTML responses
          }
        } catch (textE) {
          // Ignore if text() also fails
        }
      }
      throw new Error(errorMessage);
    }
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
