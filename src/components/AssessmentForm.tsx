import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { PatientDemographics } from './PatientDemographics';
import { AssessmentQuestion } from './AssessmentQuestion';
import { AssessmentResults } from './AssessmentResults';
import { AssessmentHistory } from './AssessmentHistory';
import { UserNav } from './UserNav';
import { ClipboardList, Calculator, Save, RotateCcw, Loader2, History, MessageCircle, CheckCircle2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAssessmentData } from '@/hooks/useAssessmentData';
import { useAssessmentStorage } from '@/hooks/useAssessmentStorage';
import { useAuth } from '@/contexts/AuthContext';

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

interface PatientData {
  patientId: string;
  age: number | '';
  name: string;
}

interface AssessmentAnswer {
  questionId: string;
  value: string;
  score: number;
}

export const AssessmentForm: React.FC = () => {
  // Load saved data from localStorage on component mount
  const [patientData, setPatientData] = useState<PatientData>(() => {
    const saved = localStorage.getItem('assessment-patient-data');
    return saved ? JSON.parse(saved) : {
      patientId: '',
      age: '',
      name: ''
    };
  });

  const [answers, setAnswers] = useState<Record<string, AssessmentAnswer>>(() => {
    const saved = localStorage.getItem('assessment-answers');
    return saved ? JSON.parse(saved) : {};
  });
  
  const [showResults, setShowResults] = useState(false);
  const [viewMode, setViewMode] = useState<'assessment' | 'history'>('assessment');
  const [assessmentSaved, setAssessmentSaved] = useState(false);
  
  // Sequential question display states
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showingQuestionIndex, setShowingQuestionIndex] = useState(0);
  const [isRevealingQuestion, setIsRevealingQuestion] = useState(false);
  
  // Refs for auto-scroll
  const questionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch assessment data from Supabase
  const { questions: allQuestions, categories: availableCategories, loading, error } = useAssessmentData();
  const { profile } = useAuth();
  const { saveAssessment, isLoading: isSaving } = useAssessmentStorage();

  const relevantQuestions = useMemo(() => {
    if (patientData.age === '') return allQuestions.filter(q => q.ageGroup === 'all');
    
    const isPediatric = patientData.age < 14;
    return allQuestions.filter(q => 
      q.ageGroup === 'all' || 
      (isPediatric && q.ageGroup === 'pediatric') ||
      (!isPediatric && q.ageGroup === 'adult')
    );
  }, [patientData.age]);

  const totalScore = useMemo(() => {
    return Object.values(answers).reduce((sum, answer) => sum + answer.score, 0);
  }, [answers]);

  const answeredQuestions = Object.keys(answers).length;
  const totalQuestions = relevantQuestions.length;
  const isComplete = answeredQuestions === totalQuestions && patientData.patientId && patientData.name && patientData.age !== '';

  // Auto-scroll to question with smooth centering
  const scrollToQuestion = useCallback((questionId: string) => {
    setTimeout(() => {
      const questionElement = questionRefs.current[questionId];
      if (questionElement && containerRef.current) {
        // Calculate the center position
        const containerRect = containerRef.current.getBoundingClientRect();
        const elementRect = questionElement.getBoundingClientRect();
        const centerOffset = containerRect.height / 2 - elementRect.height / 2;
        
        questionElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center',
          inline: 'nearest'
        });
        
        // Additional smooth centering for better positioning
        setTimeout(() => {
          const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
          const elementTop = questionElement.getBoundingClientRect().top + scrollTop;
          const viewportCenter = window.innerHeight / 2;
          const targetScroll = elementTop - viewportCenter + (elementRect.height / 2);
          
          window.scrollTo({
            top: targetScroll,
            behavior: 'smooth'
          });
        }, 50);
      }
    }, 200);
  }, []);

  // Handle revealing next question
  const revealNextQuestion = useCallback(() => {
    if (showingQuestionIndex < relevantQuestions.length - 1) {
      setIsRevealingQuestion(true);
      
      setTimeout(() => {
        setShowingQuestionIndex(prev => prev + 1);
        setIsRevealingQuestion(false);
        
        // Auto-scroll to the new question
        const nextQuestion = relevantQuestions[showingQuestionIndex + 1];
        if (nextQuestion) {
          scrollToQuestion(nextQuestion.id);
        }
      }, 250); // Brief delay for chat-like experience
    }
  }, [showingQuestionIndex, relevantQuestions, scrollToQuestion]);

  const handleAnswerChange = (questionId: string, value: string, score: number) => {
    const newAnswers = {
      ...answers,
      [questionId]: { questionId, value, score }
    };
    setAnswers(newAnswers);
    // Save to localStorage
    localStorage.setItem('assessment-answers', JSON.stringify(newAnswers));
    
    // Check if this was the current question and reveal next
    const questionIndex = relevantQuestions.findIndex(q => q.id === questionId);
    if (questionIndex === showingQuestionIndex && !answers[questionId]) {
      revealNextQuestion();
    }
  };

  const handleCalculateScore = () => {
    if (!isComplete) {
      toast({
        title: "Incomplete Assessment",
        description: "Please complete all required fields before calculating the score.",
        variant: "destructive"
      });
      return;
    }
    setShowResults(true);
    toast({
      title: "Assessment Complete",
      description: `Total acuity score: ${totalScore}`,
    });
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
        gender: patientData.patientId, // Using patientId as gender for now
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

    const assessmentId = await saveAssessment(assessmentData);
    if (assessmentId) {
      setAssessmentSaved(true);
    }
  };

  const handleReset = () => {
    setAnswers({});
    setShowResults(false);
    setAssessmentSaved(false);
    setCurrentQuestionIndex(0);
    setShowingQuestionIndex(0);
    setIsRevealingQuestion(false);
    const resetPatientData: PatientData = { patientId: '', age: '', name: '' };
    setPatientData(resetPatientData);
    
    // Clear localStorage
    localStorage.removeItem('assessment-answers');
    localStorage.removeItem('assessment-patient-data');
    
    toast({
      title: "Assessment Reset",
      description: "All data has been cleared.",
    });
  };

  const categories = useMemo(() => {
    return Array.from(new Set(relevantQuestions.map(q => q.category)));
  }, [relevantQuestions]);

  // Initialize showing question index based on existing answers
  useEffect(() => {
    if (relevantQuestions.length > 0) {
      const answeredCount = relevantQuestions.filter(q => answers[q.id]).length;
      setShowingQuestionIndex(Math.min(answeredCount, relevantQuestions.length - 1));
    }
  }, [relevantQuestions, answers]);

  // Get questions to display (up to current showing index)
  const questionsToShow = useMemo(() => {
    return relevantQuestions.slice(0, showingQuestionIndex + 1);
  }, [relevantQuestions, showingQuestionIndex]);

  // Get current unanswered question
  const currentQuestion = useMemo(() => {
    return relevantQuestions.find(q => !answers[q.id]);
  }, [relevantQuestions, answers]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-assessment p-4 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="py-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading assessment data...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-assessment p-4 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="py-8 text-center">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-assessment p-4 space-y-6">
      <header className="py-6">
        <div className="flex justify-between items-center max-w-4xl mx-auto">
          <div className="text-center flex-1">
            <h1 className="text-3xl font-bold text-primary mb-2">
              Acuity Patient Assessment System
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Comprehensive patient assessment with age-dependent scoring for clinical decision support
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
              <Button
                variant={viewMode === 'assessment' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('assessment')}
                className="gap-2"
              >
                <ClipboardList className="h-4 w-4" />
                Assessment
              </Button>
              <Button
                variant={viewMode === 'history' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('history')}
                className="gap-2"
              >
                <History className="h-4 w-4" />
                History
              </Button>
            </div>
            <UserNav />
          </div>
        </div>
        {profile && (
          <div className="text-center mt-4">
            <p className="text-sm text-muted-foreground">
              Welcome back, {profile.full_name || 'User'}
            </p>
          </div>
        )}
      </header>

      <div className="max-w-4xl mx-auto space-y-6">
        {viewMode === 'assessment' ? (
          <>
            {/* Patient Demographics */}
            <PatientDemographics
              patientData={patientData}
              onPatientDataChange={(data) => {
                setPatientData(data);
                // Save to localStorage
                localStorage.setItem('assessment-patient-data', JSON.stringify(data));
              }}
            />

            {/* Assessment Questions */}
            {patientData.age !== '' && (
              <Card className="shadow-card-custom">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-primary">
                    <ClipboardList className="h-5 w-5" />
                    Clinical Assessment
                  </CardTitle>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>
                      Progress: {answeredQuestions}/{totalQuestions} questions completed
                    </span>
                    <Badge variant={isComplete ? "default" : "secondary"}>
                      {Math.round((answeredQuestions / totalQuestions) * 100)}% Complete
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6" ref={containerRef}>
                  {/* Chat-like question flow */}
                  <div className="space-y-6">
                    {questionsToShow.map((question, index) => {
                      const isAnswered = !!answers[question.id];
                      const isCurrentQuestion = currentQuestion?.id === question.id;
                      const isNewQuestion = index === showingQuestionIndex;
                      
                      return (
                        <div
                          key={question.id}
                          ref={el => questionRefs.current[question.id] = el}
                          className={`transform transition-all duration-500 ${
                            isNewQuestion ? 'animate-fade-in animate-scale-in' : ''
                          } ${isAnswered ? 'opacity-90' : 'opacity-100'}`}
                        >
                          {/* Category header for first question in category */}
                          {(index === 0 || question.category !== questionsToShow[index - 1]?.category) && (
                            <div className="flex items-center gap-3 mb-4">
                              <MessageCircle className="h-5 w-5 text-primary" />
                              <h3 className="text-lg font-semibold text-foreground">
                                {question.category}
                              </h3>
                              <div className="flex-1 h-px bg-border"></div>
                            </div>
                          )}
                          
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
                      );
                    })}
                    
                    {/* Loading indicator for next question */}
                    {isRevealingQuestion && showingQuestionIndex < relevantQuestions.length - 1 && (
                      <div className="flex items-center gap-3 p-4 animate-fade-in">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0ms]"></div>
                          <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:150ms]"></div>
                          <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:300ms]"></div>
                        </div>
                        <span className="text-sm text-muted-foreground">Preparing next question...</span>
                      </div>
                    )}
                    
                    {/* Completion message */}
                    {showingQuestionIndex >= relevantQuestions.length - 1 && 
                     answeredQuestions === totalQuestions && (
                      <div className="text-center p-6 animate-fade-in">
                        <div className="inline-flex items-center gap-2 text-primary font-medium">
                          <CheckCircle2 className="h-5 w-5" />
                          All questions completed!
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">
                          You can now calculate your final assessment score.
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            {patientData.age !== '' && (
              <Card className="shadow-card-custom">
                <CardContent className="py-6">
                  <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">{totalScore}</div>
                        <div className="text-sm text-muted-foreground">Current Score</div>
                      </div>
                      <Separator orientation="vertical" className="h-12 hidden sm:block" />
                      <div className="text-center">
                        <div className="text-2xl font-bold text-muted-foreground">{answeredQuestions}/{totalQuestions}</div>
                        <div className="text-sm text-muted-foreground">Completed</div>
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      <Button 
                        variant="outline" 
                        onClick={handleReset}
                        className="gap-2"
                      >
                        <RotateCcw className="h-4 w-4" />
                        Reset
                      </Button>
                      <Button 
                        onClick={handleCalculateScore}
                        disabled={!isComplete}
                        className="gap-2 bg-gradient-medical hover:opacity-90 transition-opacity"
                      >
                        <Calculator className="h-4 w-4" />
                        Calculate Final Score
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Results */}
            {showResults && (
              <>
                <AssessmentResults
                  patientData={patientData}
                  answers={answers}
                  totalScore={totalScore}
                  categories={categories}
                  questions={relevantQuestions}
                />
                
                {/* Save Assessment Button */}
                {!assessmentSaved && (
                  <Card className="shadow-card-custom">
                    <CardContent className="py-6">
                      <div className="flex justify-center">
                        <Button 
                          onClick={handleSaveAssessment}
                          disabled={isSaving}
                          className="gap-2 bg-gradient-medical hover:opacity-90 transition-opacity"
                          size="lg"
                        >
                          {isSaving ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Save className="h-4 w-4" />
                          )}
                          {isSaving ? 'Saving Assessment...' : 'Save Assessment'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                {assessmentSaved && (
                  <Card className="shadow-card-custom border-green-200">
                    <CardContent className="py-6 text-center">
                      <div className="text-green-600 mb-2">
                        ✓ Assessment saved successfully!
                      </div>
                      <p className="text-sm text-muted-foreground">
                        You can view this assessment in your history at any time.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </>
        ) : (
          <AssessmentHistory />
        )}
      </div>
    </div>
  );
};