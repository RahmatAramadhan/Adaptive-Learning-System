export type UserRole = 'student' | 'teacher';
export type LearningStyle = 'visual' | 'auditory' | 'kinesthetic';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  learningStyle?: LearningStyle; // Only for students
  email: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  modules: Module[];
}

export interface Module {
  id: string;
  title: string;
  description: string;
  content: {
    visual: VisualContent;
    auditory: AuditoryContent;
    kinesthetic: KinestheticContent;
  };
}

export interface VisualContent {
  videoUrl?: string;
  images: string[];
  diagrams: string[];
  text: string;
}

export interface AuditoryContent {
  audioUrl: string;
  transcript: string;
  podcastLink?: string;
}

export interface KinestheticContent {
  learningMaterial?: string; // HTML content for the theory/practical setup
  demoVideoUrl?: string; // Optional demo video for the practical
  activityType: 'drag-drop' | 'simulation' | 'quiz';
  instructions: string; // Instructions specifically for the activity
  items: string[]; // For drag-drop
}

export interface Evaluation {
  id: string;
  courseId: string;
  moduleId?: string;
  title: string;
  createdBy?: string;
  questions: Question[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctOptionIndex: number;
}

export interface StudentAnswer {
  id: string;
  userId: string;
  evaluationId: string;
  answers: Record<string, number>;
  score: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface StudentProgress {
  studentId: string;
  courseId: string;
  moduleId: string;
  completed: boolean;
  score?: number;
  timeSpent?: number;
}

export interface StudentEvaluationResult {
  evaluationId: string;
  evaluationTitle: string;
  userName: string;
  score: number;
  correct: number;
  total: number;
  submittedAt: string;
}

export interface UserStats {
  coursesInProgress: number;
  learningTimeSeconds: number;
  learningTimeFormatted: string;
  modulesCompleted: number;
}
