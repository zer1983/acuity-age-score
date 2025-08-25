import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface QuestionOption {
  value: string;
  label: string;
  score: number;
}

interface AssessmentQuestionData {
  id: string;
  title: string;
  description?: string;
  options: QuestionOption[];
  category: string;
  ageGroup: 'all' | 'pediatric' | 'adult';
  isRequired?: boolean;
}

interface Category {
  Category_ID: string;
  Category_Title: string;
  PID: string;
}

interface Question {
  Question_ID: string;
  Question_Title: string;
  Category_ID: string;
  PID: string;
}

interface Answer {
  Question_ID: string;
  Answer_Options: string;
  Value_Answer: number;
}

interface Population {
  PID: string;
  Population: string;
}

export const useAssessmentData = () => {
  const [questions, setQuestions] = useState<AssessmentQuestionData[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAssessmentData = async () => {
      try {
        setLoading(true);
        
        // Fetch all data in parallel
        const [categoriesRes, questionsRes, answersRes, populationsRes] = await Promise.all([
          supabase.from('Category').select('*').order('Category_ID'),
          supabase.from('Question').select('*').order('Question_ID'),
          supabase.from('answer').select('*').order('Question_ID'),
          supabase.from('Population').select('*').order('PID')
        ]);

        if (categoriesRes.error) throw categoriesRes.error;
        if (questionsRes.error) throw questionsRes.error;
        if (answersRes.error) throw answersRes.error;
        if (populationsRes.error) throw populationsRes.error;

        const categories = categoriesRes.data as Category[];
        const questions = questionsRes.data as Question[];
        const answers = answersRes.data as Answer[];
        const populations = populationsRes.data as Population[];

        // Create a map for easy lookup
        const categoryMap = new Map(categories.map(cat => [cat.Category_ID, cat.Category_Title]));
        const populationMap = new Map(populations.map(pop => [pop.PID, pop.Population]));

        // Group answers by question ID
        const answersByQuestion = answers.reduce((acc, answer) => {
          if (!acc[answer.Question_ID]) {
            acc[answer.Question_ID] = [];
          }
          acc[answer.Question_ID].push(answer);
          return acc;
        }, {} as Record<string, Answer[]>);

        // Transform questions into the expected format
        const transformedQuestions: AssessmentQuestionData[] = questions.map(question => {
          const questionAnswers = answersByQuestion[question.Question_ID] || [];
          const category = categoryMap.get(question.Category_ID) || 'Unknown';
          const population = populationMap.get(question.PID);
          
          // Determine age group based on PID
          let ageGroup: 'all' | 'pediatric' | 'adult' = 'all';
          if (population === 'Pedia') ageGroup = 'pediatric';
          else if (population === 'Adult') ageGroup = 'adult';

          return {
            id: question.Question_ID,
            title: question.Question_Title,
            category,
            ageGroup,
            options: questionAnswers.map(answer => ({
              value: answer.Answer_Options.toLowerCase().replace(/[^a-z0-9]/g, '-'),
              label: answer.Answer_Options,
              score: answer.Value_Answer
            })),
            isRequired: true
          };
        });

        // Get unique categories
        const uniqueCategories = Array.from(new Set(transformedQuestions.map(q => q.category)));

        setQuestions(transformedQuestions);
        setCategories(uniqueCategories);
        setError(null);
      } catch (err) {
        console.error('Error fetching assessment data:', err);
        setError('Failed to load assessment data');
      } finally {
        setLoading(false);
      }
    };

    fetchAssessmentData();
  }, []);

  return { questions, categories, loading, error };
};