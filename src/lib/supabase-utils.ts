import { supabase } from '@/integrations/supabase/client';
import { ErrorHandler } from './error-handler';

/**
 * Utility functions for working with Supabase
 */

// Generic CRUD operations
export const supabaseUtils = {
  // Create a new record
  async create<T>(
    table: string,
    data: Partial<T>,
    context?: string
  ): Promise<{ data: T | null; error: string | null }> {
    try {
      const { data: result, error } = await supabase
        .from(table)
        .insert(data)
        .select()
        .single();

      if (error) {
        ErrorHandler.showToast(error, context);
        return { data: null, error: error.message };
      }

      return { data: result, error: null };
    } catch (error) {
      ErrorHandler.showToast(error, context);
      return { data: null, error: 'Failed to create record' };
    }
  },

  // Read records with optional filters
  async read<T>(
    table: string,
    filters?: Record<string, any>,
    context?: string
  ): Promise<{ data: T[] | null; error: string | null }> {
    try {
      let query = supabase.from(table).select('*');

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
      }

      const { data, error } = await query;

      if (error) {
        ErrorHandler.showToast(error, context);
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (error) {
      ErrorHandler.showToast(error, context);
      return { data: null, error: 'Failed to read records' };
    }
  },

  // Update a record
  async update<T>(
    table: string,
    id: string,
    data: Partial<T>,
    context?: string
  ): Promise<{ data: T | null; error: string | null }> {
    try {
      const { data: result, error } = await supabase
        .from(table)
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        ErrorHandler.showToast(error, context);
        return { data: null, error: error.message };
      }

      return { data: result, error: null };
    } catch (error) {
      ErrorHandler.showToast(error, context);
      return { data: null, error: 'Failed to update record' };
    }
  },

  // Delete a record
  async delete(
    table: string,
    id: string,
    context?: string
  ): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id);

      if (error) {
        ErrorHandler.showToast(error, context);
        return { error: error.message };
      }

      return { error: null };
    } catch (error) {
      ErrorHandler.showToast(error, context);
      return { error: 'Failed to delete record' };
    }
  },

  // Get a single record by ID
  async getById<T>(
    table: string,
    id: string,
    context?: string
  ): Promise<{ data: T | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        ErrorHandler.showToast(error, context);
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (error) {
      ErrorHandler.showToast(error, context);
      return { data: null, error: 'Failed to get record' };
    }
  },

  // Paginated query
  async paginate<T>(
    table: string,
    page: number = 1,
    limit: number = 10,
    filters?: Record<string, any>,
    context?: string
  ): Promise<{ data: T[] | null; count: number | null; error: string | null }> {
    try {
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      let query = supabase
        .from(table)
        .select('*', { count: 'exact' })
        .range(from, to);

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
      }

      const { data, error, count } = await query;

      if (error) {
        ErrorHandler.showToast(error, context);
        return { data: null, count: null, error: error.message };
      }

      return { data, count, error: null };
    } catch (error) {
      ErrorHandler.showToast(error, context);
      return { data: null, count: null, error: 'Failed to paginate records' };
    }
  }
};

// Assessment-specific utilities
export const assessmentUtils = {
  // Get assessments for a user
  async getUserAssessments(userId: string) {
    return supabaseUtils.read('assessments', { user_id: userId }, 'getUserAssessments');
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
  async saveAssessmentWithAnswers(assessmentData: any, answersData: any[]) {
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
  }
};

// Profile utilities
export const profileUtils = {
  // Get user profile
  async getUserProfile(userId: string) {
    return supabaseUtils.read('profiles', { user_id: userId }, 'getUserProfile');
  },

  // Update user profile
  async updateUserProfile(userId: string, updates: any) {
    return supabaseUtils.update('profiles', userId, updates, 'updateUserProfile');
  }
};