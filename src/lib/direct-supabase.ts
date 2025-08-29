import { supabase } from '@/integrations/supabase/client';
import { ErrorHandler } from './error-handler';

/**
 * Direct Supabase operations without generic constraints
 */

// Assessment-specific utilities
export const assessmentUtils = {
  // Get assessments for a user
  async getUserAssessments(userId: string) {
    try {
      const { data, error } = await supabase
        .from('assessments')
        .select('*')
        .eq('user_id', userId);

      if (error) {
        ErrorHandler.showToast(error, 'getUserAssessments');
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (error) {
      ErrorHandler.showToast(error, 'getUserAssessments');
      return { data: null, error: 'Failed to get user assessments' };
    }
  },

  // Get assessment with answers
  async getAssessmentWithAnswers(assessmentId: string) {
    try {
      const { data: assessment, error: assessmentError } = await supabase
        .from('assessments')
        .select('*')
        .eq('id', assessmentId)
        .single();

      if (assessmentError) {
        ErrorHandler.showToast(assessmentError, 'getAssessmentWithAnswers');
        return { data: null, error: assessmentError.message };
      }

      const { data: answers, error: answersError } = await supabase
        .from('assessment_answers')
        .select('*')
        .eq('assessment_id', assessmentId);

      if (answersError) {
        ErrorHandler.showToast(answersError, 'getAssessmentWithAnswers');
        return { data: null, error: answersError.message };
      }

      return {
        data: { ...assessment, answers },
        error: null
      };
    } catch (error) {
      ErrorHandler.showToast(error, 'getAssessmentWithAnswers');
      return { data: null, error: 'Failed to get assessment with answers' };
    }
  },

  // Save assessment with answers
  async saveAssessmentWithAnswers(assessmentData: Record<string, unknown>, answersData: Record<string, unknown>[]) {
    try {
      // Start a transaction
      const { data: assessment, error: assessmentError } = await supabase
        .from('assessments')
        .insert(assessmentData)
        .select()
        .single();

      if (assessmentError) {
        ErrorHandler.showToast(assessmentError, 'saveAssessmentWithAnswers');
        return { data: null, error: assessmentError.message };
      }

      // Add assessment_id to answers
      const answersWithId = answersData.map(answer => ({
        ...answer,
        assessment_id: assessment.id
      }));

      const { error: answersError } = await supabase
        .from('assessment_answers')
        .insert(answersWithId);

      if (answersError) {
        ErrorHandler.showToast(answersError, 'saveAssessmentWithAnswers');
        return { data: null, error: answersError.message };
      }

      return { data: assessment, error: null };
    } catch (error) {
      ErrorHandler.showToast(error, 'saveAssessmentWithAnswers');
      return { data: null, error: 'Failed to save assessment with answers' };
    }
  },

  // Update assessment
  async updateAssessment(assessmentId: string, assessmentData: Record<string, unknown>, answersData: Record<string, unknown>[]) {
    try {
      const { data: assessment, error: assessmentError } = await supabase
        .from('assessments')
        .update(assessmentData)
        .eq('id', assessmentId)
        .select()
        .single();

      if (assessmentError) {
        ErrorHandler.showToast(assessmentError, 'updateAssessment');
        return { data: null, error: assessmentError.message };
      }

      // Delete existing answers
      const { error: deleteError } = await supabase
        .from('assessment_answers')
        .delete()
        .eq('assessment_id', assessmentId);

      if (deleteError) {
        ErrorHandler.showToast(deleteError, 'updateAssessment');
        return { data: null, error: deleteError.message };
      }

      // Insert new answers
      const answersWithId = answersData.map(answer => ({
        ...answer,
        assessment_id: assessmentId
      }));

      const { error: answersError } = await supabase
        .from('assessment_answers')
        .insert(answersWithId);

      if (answersError) {
        ErrorHandler.showToast(answersError, 'updateAssessment');
        return { data: null, error: answersError.message };
      }

      return { data: assessment, error: null };
    } catch (error) {
      ErrorHandler.showToast(error, 'updateAssessment');
      return { data: null, error: 'Failed to update assessment' };
    }
  }
};

// Profile utilities
export const profileUtils = {
  // Get user profile
  async getUserProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId);

      if (error) {
        ErrorHandler.showToast(error, 'getUserProfile');
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (error) {
      ErrorHandler.showToast(error, 'getUserProfile');
      return { data: null, error: 'Failed to get user profile' };
    }
  },

  // Update user profile
  async updateUserProfile(userId: string, updates: Record<string, unknown>) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        ErrorHandler.showToast(error, 'updateUserProfile');
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (error) {
      ErrorHandler.showToast(error, 'updateUserProfile');
      return { data: null, error: 'Failed to update user profile' };
    }
  }
};

// Hospital structure utilities
export const hospitalUtils = {
  // Get all units
  async getUnits() {
    try {
      const { data, error } = await supabase
        .from('units')
        .select('*')
        .order('name');

      if (error) {
        ErrorHandler.showToast(error, 'getUnits');
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (error) {
      ErrorHandler.showToast(error, 'getUnits');
      return { data: null, error: 'Failed to get units' };
    }
  },

  // Get all rooms
  async getRooms() {
    try {
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .order('name');

      if (error) {
        ErrorHandler.showToast(error, 'getRooms');
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (error) {
      ErrorHandler.showToast(error, 'getRooms');
      return { data: null, error: 'Failed to get rooms' };
    }
  },

  // Get all beds
  async getBeds() {
    try {
      const { data, error } = await supabase
        .from('beds')
        .select('*')
        .order('label');

      if (error) {
        ErrorHandler.showToast(error, 'getBeds');
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (error) {
      ErrorHandler.showToast(error, 'getBeds');
      return { data: null, error: 'Failed to get beds' };
    }
  }
};