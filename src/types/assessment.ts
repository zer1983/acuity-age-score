// Core assessment types
export interface QuestionOption {
  value: string;
  label: string;
  score: number;
}

export interface AssessmentQuestion {
  id: string;
  title: string;
  description?: string;
  options: QuestionOption[];
  category: string;
  ageGroup: 'all' | 'pediatric' | 'adult';
  isRequired?: boolean;
  order?: number;
}

export interface PatientData {
  patientId: string;
  age: number | '';
  name: string;
  gender?: string;
}

export interface AssessmentAnswer {
  questionId: string;
  value: string;
  score: number;
}

export interface AssessmentSubmission {
  patientData: PatientData;
  answers: AssessmentAnswer[];
  totalScore: number;
  assessmentDate: Date;
}

// Database types
export interface SavedAssessment {
  id: string;
  user_id: string;
  patient_name: string;
  patient_age: number;
  patient_gender: string;
  total_score: number;
  assessment_date: string;
  created_at: string;
  updated_at: string;
  answers: AssessmentAnswerRecord[];
}

export interface AssessmentAnswerRecord {
  id: string;
  assessment_id: string;
  question_id: string;
  question_title: string;
  category: string;
  selected_value: string;
  selected_label: string;
  selected_score: number;
  created_at: string;
}

// Form state types
export interface AssessmentFormState {
  patientData: PatientData;
  answers: Record<string, AssessmentAnswer>;
  showResults: boolean;
  viewMode: 'assessment' | 'history';
  assessmentSaved: boolean;
  isEditMode: boolean;
}

// API response types
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Filter and search types
export interface AssessmentFilters {
  dateRange?: {
    start: Date;
    end: Date;
  };
  patientName?: string;
  category?: string;
  minScore?: number;
  maxScore?: number;
}

export interface SortOptions {
  field: keyof SavedAssessment;
  direction: 'asc' | 'desc';
}