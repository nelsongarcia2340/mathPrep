export type Course =
  | 'Algebra I'
  | 'Algebra II'
  | 'Geometry'
  | 'Trig'
  | 'Precalc'
  | 'Stats'
  | 'AP Calc';

export type GradeLevel = '9th' | '10th' | '11th' | '12th';

export type Difficulty = 'easy' | 'medium' | 'hard';

export type QuestionType = 'multiple-choice' | 'numeric';

export interface SolutionStep {
  title: string;
  detail: string;
}

export interface BaseQuestion {
  id: string;
  topicId: string;
  subtopicId: string;
  prompt: string;
  difficulty: Difficulty;
  explanation: string;
  solutionSteps: SolutionStep[];
}

export interface MultipleChoiceQuestion extends BaseQuestion {
  type: 'multiple-choice';
  choices: string[];
  correctAnswer: string;
}

export interface NumericQuestion extends BaseQuestion {
  type: 'numeric';
  correctAnswer: number;
  tolerance?: number;
}

export type Question = MultipleChoiceQuestion | NumericQuestion;

export interface Subtopic {
  id: string;
  title: string;
  summary: string;
  questionIds: string[];
}

export interface Topic {
  id: string;
  subject: Course;
  title: string;
  summary: string;
  difficulties: Difficulty[];
  subtopics: Subtopic[];
}

export interface TopicProgress {
  topicId: string;
  mastery: number;
  attempted: number;
  correct: number;
  currentDifficulty: Difficulty;
  correctStreak: number;
  wrongStreak: number;
  lastPracticedAt?: string;
}

export interface MistakeEntry {
  id: string;
  questionId: string;
  selectedAnswer: string;
  correctAnswer: string;
  topicId: string;
  missedAt: string;
  reviewed: boolean;
}

export interface DiagnosticResult {
  topicId: string;
  score: number;
  recommendedDifficulty: Difficulty;
}

export interface UserProfile {
  name?: string;
  gradeLevel: GradeLevel;
  course: Course;
  diagnosticCompleted: boolean;
  diagnosticResults: DiagnosticResult[];
}

export interface UserProgress {
  profile?: UserProfile;
  topicProgress: Record<string, TopicProgress>;
  mistakeJournal: MistakeEntry[];
  xp: number;
  level: number;
  dailyStreak: number;
  lastActiveDate?: string;
}
