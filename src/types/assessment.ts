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
  unit_id?: string;
  room_id?: string;
  bed_id?: string;
}

// Database patient record
export interface Patient {
  id: string;
  patient_id: string;
  name: string;
  age: number;
  gender: string;
  unit_id?: string;
  room_id?: string;
  bed_id?: string;
  admission_date: string;
  discharge_date?: string;
  status: 'active' | 'discharged';
  created_at: string;
  updated_at: string;
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
  shift: 'morning' | 'evening';
  assessment_data?: Record<string, unknown>;
  created_by?: string;
  unit_id?: string;
  room_id?: string;
  bed_id?: string;
  patient_id?: string;
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

// User role types
export type UserRole = 'user' | 'admin' | 'hospital_admin' | 'system_admin';

export interface UserProfile {
  id: string;
  user_id: string;
  full_name?: string;
  email?: string;
  username?: string;
  role: UserRole;
  unit_id?: string;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  unit_id?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Hospital structure types
export interface Unit {
  id: string;
  name: string;
  description?: string;
  capacity?: number;
  floor_number?: number;
  hospital_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Room {
  id: string;
  name: string;
  room_number: string;
  unit_id: string;
  room_type?: string;
  capacity: number;
  created_at: string;
  updated_at: string;
}

export interface Bed {
  id: string;
  label: string;
  bed_number: string;
  room_id: string;
  bed_type?: string;
  is_occupied?: boolean;
  bed_status: 'occupied' | 'available';
  created_at: string;
  updated_at: string;
}