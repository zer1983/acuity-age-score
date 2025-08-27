/**
 * Examples of how to use Supabase utilities
 * This file demonstrates common patterns for working with Supabase
 */

import { supabaseUtils, assessmentUtils, profileUtils } from '@/lib/supabase-utils';
import { useAuth } from '@/contexts/AuthContext';

// Example 1: Basic CRUD operations
export const basicCrudExamples = {
  // Create a new record
  async createExample() {
    const newData = {
      name: 'John Doe',
      email: 'john@example.com',
      age: 30
    };

    const { data, error } = await supabaseUtils.create('profiles', newData, 'createExample');
    
    if (error) {
      console.error('Failed to create:', error);
      return;
    }
    
    console.log('Created:', data);
  },

  // Read records with filters
  async readExample() {
    const filters = {
      age: 30,
      active: true
    };

    const { data, error } = await supabaseUtils.read('profiles', filters, 'readExample');
    
    if (error) {
      console.error('Failed to read:', error);
      return;
    }
    
    console.log('Found records:', data);
  },

  // Update a record
  async updateExample(id: string) {
    const updates = {
      age: 31,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabaseUtils.update('profiles', id, updates, 'updateExample');
    
    if (error) {
      console.error('Failed to update:', error);
      return;
    }
    
    console.log('Updated:', data);
  },

  // Delete a record
  async deleteExample(id: string) {
    const { error } = await supabaseUtils.delete('profiles', id, 'deleteExample');
    
    if (error) {
      console.error('Failed to delete:', error);
      return;
    }
    
    console.log('Deleted successfully');
  }
};

// Example 2: Assessment-specific operations
export const assessmentExamples = {
  // Get all assessments for a user
  async getUserAssessments(userId: string) {
    const { data, error } = await assessmentUtils.getUserAssessments(userId);
    
    if (error) {
      console.error('Failed to get assessments:', error);
      return;
    }
    
    console.log('User assessments:', data);
    return data;
  },

  // Get a specific assessment with all its answers
  async getAssessmentDetails(assessmentId: string) {
    const { data, error } = await assessmentUtils.getAssessmentWithAnswers(assessmentId);
    
    if (error) {
      console.error('Failed to get assessment details:', error);
      return;
    }
    
    console.log('Assessment with answers:', data);
    return data;
  },

  // Save a new assessment with answers
  async saveNewAssessment(userId: string) {
    const assessmentData = {
      user_id: userId,
      patient_name: 'Jane Smith',
      patient_age: 25,
      patient_gender: 'female',
      total_score: 85,
      assessment_date: new Date().toISOString()
    };

    const answersData = [
      {
        question_id: 'q1',
        question_title: 'How are you feeling today?',
        category: 'mood',
        selected_value: 'good',
        selected_label: 'Good',
        selected_score: 5
      },
      {
        question_id: 'q2',
        question_title: 'Rate your energy level',
        category: 'energy',
        selected_value: 'moderate',
        selected_label: 'Moderate',
        selected_score: 3
      }
    ];

    const { data, error } = await assessmentUtils.saveAssessmentWithAnswers(assessmentData, answersData);
    
    if (error) {
      console.error('Failed to save assessment:', error);
      return;
    }
    
    console.log('Assessment saved:', data);
    return data;
  }
};

// Example 3: Profile operations
export const profileExamples = {
  // Get user profile
  async getUserProfile(userId: string) {
    const { data, error } = await profileUtils.getUserProfile(userId);
    
    if (error) {
      console.error('Failed to get profile:', error);
      return;
    }
    
    console.log('User profile:', data);
    return data;
  },

  // Update user profile
  async updateUserProfile(userId: string) {
    const updates = {
      full_name: 'Updated Name',
      role: 'admin',
      updated_at: new Date().toISOString()
    };

    const { data, error } = await profileUtils.updateUserProfile(userId, updates);
    
    if (error) {
      console.error('Failed to update profile:', error);
      return;
    }
    
    console.log('Profile updated:', data);
    return data;
  }
};

// Example 4: Pagination
export const paginationExample = {
  async getPaginatedAssessments(page: number = 1, limit: number = 10) {
    const filters = {
      active: true
    };

    const { data, count, error } = await supabaseUtils.paginate(
      'assessments',
      page,
      limit,
      filters,
      'getPaginatedAssessments'
    );
    
    if (error) {
      console.error('Failed to get paginated assessments:', error);
      return;
    }
    
    console.log(`Page ${page}:`, data);
    console.log('Total count:', count);
    return { data, count };
  }
};

// Example 5: React Hook usage
export const useSupabaseExamples = () => {
  const { user } = useAuth();

  const examples = {
    // Get current user's assessments
    async getMyAssessments() {
      if (!user) {
        console.error('No user logged in');
        return;
      }

      return await assessmentExamples.getUserAssessments(user.id);
    },

    // Get current user's profile
    async getMyProfile() {
      if (!user) {
        console.error('No user logged in');
        return;
      }

      return await profileExamples.getUserProfile(user.id);
    },

    // Update current user's profile
    async updateMyProfile(updates: any) {
      if (!user) {
        console.error('No user logged in');
        return;
      }

      return await profileUtils.updateUserProfile(user.id, updates);
    }
  };

  return examples;
};