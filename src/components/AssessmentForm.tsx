import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PatientDemographics } from './PatientDemographics';
import { AssessmentQuestion } from './AssessmentQuestion';
import { AssessmentResults } from './AssessmentResults';
import { AssessmentHistory } from './AssessmentHistory';
import { UserNav } from './UserNav';
import { ClipboardList, Calculator, Save, RotateCcw, Loader2, History, MessageCircle, CheckCircle2, Edit } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAssessmentData } from '@/hooks/useAssessmentData';
import { useAssessmentStorage } from '@/hooks/useAssessmentStorage';

import { ErrorHandler } from '@/lib/error-handler';





interface PatientData {
  patientId: string;
  age: number | '';
  name: string;
  gender?: string;
  unit_id?: string;
  room_id?: string;
  bed_id?: string;
}

interface AssessmentAnswer {
  questionId: string;
  value: string;
  score: number;
}

export const AssessmentForm: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editAssessmentId = searchParams.get('edit');
  const [isEditMode, setIsEditMode] = useState(!!editAssessmentId);
  const [isLoadingEdit, setIsLoadingEdit] = useState(false);
  
  // Load saved data from localStorage on component mount
  const [patientData, setPatientData] = useState<PatientData>(() => {
    const saved = localStorage.getItem('assessment-patient-data');
    return saved ? JSON.parse(saved) : {
      patientId: '',
      age: '',
      name: '',
      gender: '',
      unit_id: '',
      room_id: '',
      bed_id: ''
    };
  });

  const [answers, setAnswers] = useState<Record<string, AssessmentAnswer>>(() => {
    const saved = localStorage.getItem('assessment-answers');
    return saved ? JSON.parse(saved) : {};
  });
  
  const [showResults, setShowResults] = useState(false);
  const [viewMode, setViewMode] = useState<'assessment' | 'history'>('assessment');

  
  // Refs for auto-scroll
  const questionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch assessment data from Supabase
  const { questions: allQuestions, loading, error } = useAssessmentData();
  const { saveAssessment, updateAssessment, getAssessmentById, isLoading: isSaving } = useAssessmentStorage();

  const relevantQuestions = useMemo(() => {
    if (patientData.age === '') return allQuestions.filter(q => q.ageGroup === 'all');
    
    const isPediatric = patientData.age < 14;
    return allQuestions.filter(q => 
      q.ageGroup === 'all' || 
      (isPediatric && q.ageGroup === 'pediatric') ||
      (!isPediatric && q.ageGroup === 'adult')
    );
  }, [patientData.age, allQuestions]);

  const totalScore = useMemo(() => {
    return Object.values(answers).reduce((sum, answer) => sum + answer.score, 0);
  }, [answers]);

  const answeredQuestions = Object.keys(answers).length;
  const totalQuestions = relevantQuestions.length;
  const isComplete = answeredQuestions === totalQuestions && patientData.patientId && patientData.name && patientData.age !== '';

  // Load existing assessment data for edit mode
  useEffect(() => {
    const loadAssessmentForEdit = async () => {
      if (editAssessmentId && isEditMode) {
        setIsLoadingEdit(true);
        try {
          const assessment = await getAssessmentById(editAssessmentId);
          if (assessment) {
            // Load patient data with proper mapping
            setPatientData({
              patientId: assessment.patient_gender || '',
              age: assessment.patient_age,
              name: assessment.patient_name,
              gender: assessment.patient_gender,
              unit_id: (assessment as any).unit_id || '',
              room_id: (assessment as any).room_id || '',
              bed_id: (assessment as any).bed_id || ''
            });

            // Load answers
            const loadedAnswers: Record<string, AssessmentAnswer> = {};
            assessment.answers.forEach(answer => {
              loadedAnswers[answer.question_id] = {
                questionId: answer.question_id,
                value: answer.selected_value,
                score: answer.selected_score
              };
            });
            setAnswers(loadedAnswers);
            
            // Show results if assessment was completed
            if (assessment.total_score !== null) {
              setShowResults(true);
            }
            
            // Save to localStorage for persistence
            localStorage.setItem('assessment-patient-data', JSON.stringify({
              patientId: assessment.patient_gender || '',
              age: assessment.patient_age,
              name: assessment.patient_name,
              gender: assessment.patient_gender,
              unit_id: (assessment as any).unit_id || '',
              room_id: (assessment as any).room_id || '',
              bed_id: (assessment as any).bed_id || ''
            }));
            localStorage.setItem('assessment-answers', JSON.stringify(loadedAnswers));
            
            toast({
              title: "Assessment Loaded",
              description: "Assessment data loaded for editing. You can now modify the answers.",
            });
          } else {
            toast({
              title: "Assessment Not Found",
              description: "The assessment you're trying to edit could not be found.",
              variant: "destructive"
            });
            // Exit edit mode and redirect to main assessment
            setIsEditMode(false);
            navigate('/assessment', { replace: true });
          }
        } catch (error) {
          ErrorHandler.showToast(error, 'loadAssessmentForEdit');
          // Exit edit mode and redirect to main assessment
          setIsEditMode(false);
          navigate('/assessment', { replace: true });
        } finally {
          setIsLoadingEdit(false);
        }
      }
    };

    loadAssessmentForEdit();
  }, [editAssessmentId, isEditMode, getAssessmentById, navigate]);

  // Update URL when edit mode changes
  useEffect(() => {
    if (isEditMode && editAssessmentId) {
      navigate(`/assessment?edit=${editAssessmentId}`, { replace: true });
    } else if (!isEditMode) {
      navigate('/assessment', { replace: true });
    }
  }, [isEditMode, editAssessmentId, navigate]);

  // Scroll to center the current question perfectly  
  const scrollToQuestion = useCallback((questionId: string) => {
    setTimeout(() => {
      const questionElement = questionRefs.current[questionId];
      if (!questionElement) return;
      
      const rect = questionElement.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const elementTop = rect.top + currentScrollTop;
      
      // Calculate center position
      const targetScrollTop = elementTop - (viewportHeight / 2) + (rect.height / 2);
      
      window.scrollTo({
        top: Math.max(0, targetScrollTop),
        behavior: 'smooth'
      });
    }, 150); // Faster timing for smoother flow
  }, []);

  const handleAnswerChange = (questionId: string, value: string, score: number) => {
    const newAnswers = {
      ...answers,
      [questionId]: { questionId, value, score }
    };
    setAnswers(newAnswers);
    localStorage.setItem('assessment-answers', JSON.stringify(newAnswers));
    
    // Find the next unanswered question and scroll to it
    setTimeout(() => {
      const nextUnansweredQuestion = relevantQuestions.find(q => !newAnswers[q.id]);
      if (nextUnansweredQuestion) {
        scrollToQuestion(nextUnansweredQuestion.id);
      }
    }, 300); // Wait for transition to complete
  };

  const handleCalculateScore = async () => {
    if (!isComplete) {
      toast({
        title: "Incomplete Assessment",
        description: "Please complete all required fields before calculating the score.",
        variant: "destructive"
      });
      return;
    }
    
    setShowResults(true);
    
    // Auto-save the assessment
    const assessmentData = {
      patientData: {
        name: patientData.name,
        age: patientData.age as number,
        gender: patientData.gender || patientData.patientId, // Use gender field if available
        unit_id: patientData.unit_id,
        room_id: patientData.room_id,
        bed_id: patientData.bed_id,
      },
      answers: Object.values(answers).map(answer => {
        const question = relevantQuestions.find(q => q.id === answer.questionId);
        const option = question?.options.find(opt => opt.value === answer.value);
        return {
          questionId: answer.questionId,
          questionTitle: question?.title || '',
          category: question?.category || '',
          selectedValue: answer.value,
          selectedLabel: option?.label || '',
          selectedScore: answer.score,
        };
      }),
      totalScore,
    };

    if (isEditMode && editAssessmentId) {
      // Update existing assessment
      const success = await updateAssessment(editAssessmentId, assessmentData);
      if (success) {
        // Clear localStorage since we've updated the database
        localStorage.removeItem('assessment-answers');
        localStorage.removeItem('assessment-patient-data');
        
        toast({
          title: "Assessment Updated & Saved",
          description: `Assessment updated successfully! Total score: ${totalScore}`,
        });
        
        // Navigate to summary page
        navigate(`/assessment/${editAssessmentId}`);
      }
    } else {
      // Create new assessment
      const assessmentId = await saveAssessment(assessmentData);
      if (assessmentId) {
        // Clear localStorage since we've saved to database
        localStorage.removeItem('assessment-answers');
        localStorage.removeItem('assessment-patient-data');
        
        toast({
          title: "Assessment Complete & Saved",
          description: `Assessment saved successfully! Total score: ${totalScore}`,
        });
        
        // Navigate to summary page
        navigate(`/assessment/${assessmentId}`);
      } else {
        toast({
          title: "Assessment Complete",
          description: `Total acuity score: ${totalScore}. Please try saving manually if needed.`,
        });
      }
    }
  };

  const handleSaveAssessment = async () => {
    if (!showResults || !isComplete) {
      toast({
        title: "Cannot Save Assessment",
        description: "Please complete and calculate the assessment first.",
        variant: "destructive"
      });
      return;
    }

    // Prepare the assessment data for storage
    const assessmentData = {
      patientData: {
        name: patientData.name,
        age: patientData.age as number,
        gender: patientData.gender || patientData.patientId,
        unit_id: patientData.unit_id,
        room_id: patientData.room_id,
        bed_id: patientData.bed_id,
      },
      answers: Object.values(answers).map(answer => {
        const question = relevantQuestions.find(q => q.id === answer.questionId);
        const option = question?.options.find(opt => opt.value === answer.value);
        return {
          questionId: answer.questionId,
          questionTitle: question?.title || '',
          category: question?.category || '',
          selectedValue: answer.value,
          selectedLabel: option?.label || '',
          selectedScore: answer.score,
        };
      }),
      totalScore,
    };

    if (isEditMode && editAssessmentId) {
      const success = await updateAssessment(editAssessmentId, assessmentData);
      if (success) {
        setAssessmentSaved(true);
      }
    } else {
      const assessmentId = await saveAssessment(assessmentData);
      if (assessmentId) {
        setAssessmentSaved(true);
      }
    }
  };

  const handleReset = () => {
    setAnswers({});
    setShowResults(false);
    setAssessmentSaved(false);
    const resetPatientData: PatientData = { patientId: '', age: '', name: '', gender: '' };
    setPatientData(resetPatientData);
    
    // Clear localStorage
    localStorage.removeItem('assessment-answers');
    localStorage.removeItem('assessment-patient-data');
    
    // Exit edit mode
    setIsEditMode(false);
    navigate('/assessment', { replace: true });
    
    toast({
      title: "Assessment Reset",
      description: "All data has been cleared. You can start a new assessment.",
    });
  };

  const handlePatientDataChange = (newPatientData: PatientData) => {
    setPatientData(newPatientData);
    localStorage.setItem('assessment-patient-data', JSON.stringify(newPatientData));
  };

  // Show loading state while editing
  if (isLoadingEdit) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Loading Assessment...</h2>
              <p className="text-muted-foreground">Please wait while we load your assessment data.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Loading Assessment Data...</h2>
              <p className="text-muted-foreground">Please wait while we load the assessment questions.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <MessageCircle className="h-8 w-8 mx-auto mb-4 text-red-500" />
              <h2 className="text-xl font-semibold mb-2">Error Loading Assessment</h2>
              <p className="text-muted-foreground mb-4">Failed to load assessment data. Please try refreshing the page.</p>
              <Button onClick={() => window.location.reload()}>
                Refresh Page
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <ClipboardList className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {isEditMode ? 'Edit Assessment' : 'Patient Assessment'}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {isEditMode 
                  ? 'Modify the assessment data below' 
                  : 'Complete the assessment to evaluate patient acuity'
                }
              </p>
            </div>
            {isEditMode && (
              <Badge variant="secondary" className="ml-2">
                <Edit className="h-3 w-3 mr-1" />
                Edit Mode
              </Badge>
            )}
          </div>
          <UserNav />
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={viewMode === 'assessment' ? 'default' : 'outline'}
            onClick={() => setViewMode('assessment')}
            className="flex items-center gap-2"
          >
            <Calculator className="h-4 w-4" />
            Assessment
          </Button>
          <Button
            variant={viewMode === 'history' ? 'default' : 'outline'}
            onClick={() => setViewMode('history')}
            className="flex items-center gap-2"
          >
            <History className="h-4 w-4" />
            History
          </Button>
        </div>

        {viewMode === 'assessment' ? (
          <div className="space-y-6">
            {/* Patient Demographics */}
            <PatientDemographics
              patientData={patientData}
              onPatientDataChange={handlePatientDataChange}
            />

            {/* Progress Indicator */}
            <Card className="border-l-4 border-l-primary">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    <span className="font-semibold">Progress</span>
                  </div>
                  <Badge variant="outline">
                    {answeredQuestions} / {totalQuestions} Questions
                  </Badge>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(answeredQuestions / totalQuestions) * 100}%` }}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Assessment Questions */}
            <div ref={containerRef} className="space-y-6">
              {relevantQuestions.map((question) => (
                <div
                  key={question.id}
                  ref={(el) => (questionRefs.current[question.id] = el)}
                >
                  <AssessmentQuestion
                    id={question.id}
                    title={question.title}
                    description={question.description}
                    options={question.options}
                    selectedValue={answers[question.id]?.value || ''}
                    onValueChange={handleAnswerChange}
                    category={question.category}
                    isRequired={question.isRequired}
                  />
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-6">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={handleReset}
                  className="flex items-center gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  {isEditMode ? 'Cancel Edit' : 'Reset'}
                </Button>
              </div>
              
              <div className="flex items-center gap-2">
                {showResults && (
                  <Button
                    variant="outline"
                    onClick={handleSaveAssessment}
                    disabled={isSaving}
                    className="flex items-center gap-2"
                  >
                    {isSaving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    {isSaving ? 'Saving...' : 'Save Assessment'}
                  </Button>
                )}
                
                <Button
                  onClick={handleCalculateScore}
                  disabled={!isComplete || isSaving}
                  className="flex items-center gap-2"
                >
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Calculator className="h-4 w-4" />
                  )}
                  {isSaving ? 'Processing...' : 'Calculate Score'}
                </Button>
              </div>
            </div>

            {/* Results */}
            {showResults && (
              <AssessmentResults
                totalScore={totalScore}
                answers={answers}
                questions={relevantQuestions}
                patientData={patientData}
                isEditMode={isEditMode}
              />
            )}
          </div>
        ) : (
          <AssessmentHistory />
        )}
      </div>
    </div>
  );
};