// Course structure types used by Dashboard.

export interface Topic {
  id: number;
  title: string;
  description?: string;
  implemented?: boolean;
}

export interface Concept {
  id: string;
  title: string;
  topics: Topic[];
  icon?: string;
}

export interface Course {
  id: number;
  title: string;
  description: string;
  image: string;
  concepts: Concept[];
}

export interface CompletedQuiz {
  courseId: number;
  score: number;
  passed: boolean;
  timestamp: string;
}
