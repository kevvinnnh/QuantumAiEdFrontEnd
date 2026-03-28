// Unified quiz type definitions.

export interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  lessonContentIndices?: number[];
}

export interface AllQuizData {
  [courseId: number]: Question[];
}

export interface QuestionWithLesson extends Question {
  lessonContentIndices?: number[];
}
