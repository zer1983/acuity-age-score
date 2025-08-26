import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

interface PatientData {
  name: string;
  age: number;
  gender: string;
}

interface AssessmentAnswer {
  questionId: string;
  questionTitle: string;
  category: string;
  selectedValue: string;
  selectedLabel: string;
  selectedScore: number;
}

interface AssessmentSubmission {
  patientData: PatientData;
  answers: AssessmentAnswer[];
  totalScore: number;
}

interface SavedAssessment {
  id: string;
  patient_name: string;
  patient_age: number;
  patient_gender: string;
  total_score: number;
  assessment_date: string;
  answers: {
    question_id: string;
    question_title: string;
    category: string;
    selected_value: string;
    selected_label: string;
    selected_score: number;
  }[];
}

export const useAssessmentStorage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const saveAssessment = async (submission: AssessmentSubmission) => {
    if (!user) {
      toast.error('User must be authenticated to save assessments');
      return null;
    }

    setIsLoading(true);
    try {
      // First, create the assessment record
      const { data: assessment, error: assessmentError } = await supabase
        .from('assessments')
        .insert({
          user_id: user.id,
          patient_name: submission.patientData.name,
          patient_age: submission.patientData.age,
          patient_gender: submission.patientData.gender,
          total_score: submission.totalScore,
        })
        .select()
        .single();

      if (assessmentError) {
        console.error('Error saving assessment:', assessmentError);
        toast.error('Failed to save assessment');
        return null;
      }

      // Then, save all the individual answers
      const answersToInsert = submission.answers.map(answer => ({
        assessment_id: assessment.id,
        question_id: answer.questionId,
        question_title: answer.questionTitle,
        category: answer.category,
        selected_value: answer.selectedValue,
        selected_label: answer.selectedLabel,
        selected_score: answer.selectedScore,
      }));

      const { error: answersError } = await supabase
        .from('assessment_answers')
        .insert(answersToInsert);

      if (answersError) {
        console.error('Error saving assessment answers:', answersError);
        toast.error('Failed to save assessment answers');
        return null;
      }

      toast.success('Assessment saved successfully!');
      return assessment.id;
    } catch (error) {
      console.error('Unexpected error saving assessment:', error);
      toast.error('An unexpected error occurred');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const getAssessmentHistory = async (): Promise<SavedAssessment[]> => {
    if (!user) {
      return [];
    }

    setIsLoading(true);
    try {
      // Get assessments with their answers
      const { data: assessments, error: assessmentsError } = await supabase
        .from('assessments')
        .select(`
          id,
          patient_name,
          patient_age,
          patient_gender,
          total_score,
          assessment_date,
          assessment_answers (
            question_id,
            question_title,
            category,
            selected_value,
            selected_label,
            selected_score
          )
        `)
        .eq('user_id', user.id)
        .order('assessment_date', { ascending: false });

      if (assessmentsError) {
        console.error('Error fetching assessment history:', assessmentsError);
        toast.error('Failed to load assessment history');
        return [];
      }

      // Map the data to match our interface
      return (assessments || []).map(assessment => ({
        ...assessment,
        answers: assessment.assessment_answers || []
      }));
    } catch (error) {
      console.error('Unexpected error fetching assessment history:', error);
      toast.error('An unexpected error occurred');
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const getAssessmentById = async (assessmentId: string): Promise<SavedAssessment | null> => {
    if (!user) {
      return null;
    }

    setIsLoading(true);
    try {
      const { data: assessment, error } = await supabase
        .from('assessments')
        .select(`
          id,
          patient_name,
          patient_age,
          patient_gender,
          total_score,
          assessment_date,
          assessment_answers (
            question_id,
            question_title,
            category,
            selected_value,
            selected_label,
            selected_score
          )
        `)
        .eq('id', assessmentId)
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching assessment:', error);
        toast.error('Failed to load assessment');
        return null;
      }

      return {
        ...assessment,
        answers: assessment.assessment_answers || []
      };
    } catch (error) {
      console.error('Unexpected error fetching assessment:', error);
      toast.error('An unexpected error occurred');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    saveAssessment,
    getAssessmentHistory,
    getAssessmentById,
    isLoading,
  };
};