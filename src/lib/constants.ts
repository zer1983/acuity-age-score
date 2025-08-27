// Application constants
export const APP_CONFIG = {
  name: 'Assessment Tool',
  version: '1.0.0',
  maxFileSize: 5 * 1024 * 1024, // 5MB
  supportedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
} as const;

// Local storage keys
export const STORAGE_KEYS = {
  ASSESSMENT_ANSWERS: 'assessment-answers',
  PATIENT_DATA: 'assessment-patient-data',
  USER_PREFERENCES: 'user-preferences',
} as const;

// Assessment constants
export const ASSESSMENT_CONFIG = {
  MIN_AGE: 0,
  MAX_AGE: 120,
  PEDIATRIC_AGE_THRESHOLD: 14,
  DEFAULT_QUESTIONS_PER_PAGE: 10,
} as const;

// API endpoints
export const API_ENDPOINTS = {
  ASSESSMENTS: '/assessments',
  QUESTIONS: '/questions',
  PROFILES: '/profiles',
} as const;

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection and try again.',
  AUTH_REQUIRED: 'Authentication required. Please sign in to continue.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
} as const;

// Success messages
export const SUCCESS_MESSAGES = {
  ASSESSMENT_SAVED: 'Assessment saved successfully.',
  PROFILE_UPDATED: 'Profile updated successfully.',
  DATA_LOADED: 'Data loaded successfully.',
} as const;

// Validation rules
export const VALIDATION_RULES = {
  PASSWORD_MIN_LENGTH: 6,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50,
} as const;