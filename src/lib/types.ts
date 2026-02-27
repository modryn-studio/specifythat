// TypeScript interfaces for SpecifyThat

export interface Answer {
  question: string;
  answer: string;
  isAIGenerated: boolean;
}

export interface InterviewSession {
  id: string;
  currentQuestionIndex: number;
  answers: Answer[];
  status: 'in_progress' | 'completed';
  createdAt: string; // ISO string for serialization
}

export interface QuestionValidation {
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  patternMessage?: string;
  sanitize?: boolean;
}

export interface Question {
  id: number;
  text: string;
  contextForAI: string;
  section: string;
  sectionNumber: number;
  allowFileUpload?: boolean;
  fileTypes?: string[];
  helpText?: string;
  validation?: QuestionValidation;
}

export interface GenerateAnswerRequest {
  question: string;
  conversationContext: Answer[];
  userInput: string;
}

export interface GenerateAnswerResponse {
  answer: string;
}

export interface GenerateSpecRequest {
  answers: Answer[];
}

export interface GenerateSpecResponse {
  spec: string;
}

// Q2 Analysis Types
export interface BuildableUnit {
  id: number;
  name: string;
  description: string;
}

export interface AnalysisResultSingle {
  type: 'single';
  summary: string;
}

export interface AnalysisResultMultiple {
  type: 'multiple';
  units: BuildableUnit[];
}

export type AnalysisResult = AnalysisResultSingle | AnalysisResultMultiple;

export interface AnalyzeProjectRequest {
  projectDescription: string;
  attachedDocContent?: string;
}

export interface AnalyzeProjectResponse {
  result: AnalysisResult;
  fallback?: boolean;
  error?: string;
}

// Extended session state for Q2 analysis
export interface InterviewSessionExtended extends InterviewSession {
  projectSummary: string;
  wasMultiUnit: boolean;
  selectedUnitId: number | null;
  allUnits?: BuildableUnit[];
}

// Auto-generation types
export interface GeneratedAnswer {
  questionId: number;
  questionText: string;
  answer: string;
  section?: string;
  isAIGenerated?: boolean;
  isComplete?: boolean;
}

// Ideation Mode Types (for Q2 "I don't know")
export interface IdeationAnswers {
  problemFrustration?: string;
  targetUser?: string;
  category?: string;
}

export interface GenerateProjectDescriptionRequest {
  ideationAnswers: IdeationAnswers;
}

export interface GenerateProjectDescriptionResponse {
  projectDescription: string;
  error?: string;
}

// Spec storage types
export interface SpecEntry {
  id: string;
  projectName: string;
  spec: string;
  answers: Answer[];
  createdAt: string; // ISO string
}

// Interview phases (state machine)
export type InterviewPhase =
  | 'project_input'  // User entering project description
  | 'analyzing'      // AI analyzing description
  | 'unit_picker'    // Multi-unit: user picking which unit to spec
  | 'interview'      // Active question/answer loop
  | 'generating'     // AI assembling final spec
  | 'done';          // Spec ready
