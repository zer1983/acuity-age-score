import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { PatientDemographics } from './PatientDemographics';
import { AssessmentQuestion } from './AssessmentQuestion';
import { AssessmentResults } from './AssessmentResults';
import { ClipboardList, Calculator, Save, RotateCcw } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

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
  const [patientData, setPatientData] = useState<PatientData>({
    patientId: '',
    age: '',
    name: ''
  });

  const [answers, setAnswers] = useState<Record<string, AssessmentAnswer>>({});
  const [showResults, setShowResults] = useState(false);

  // Sample assessment questions - in real app, this would come from API/config
  const allQuestions: AssessmentQuestionData[] = [
    {
      id: 'neurological-1',
      title: 'Level of Consciousness',
      description: 'Patient\'s response to verbal and physical stimuli',
      category: 'Neurological',
      ageGroup: 'all',
      options: [
        { value: 'alert', label: 'Alert and oriented', score: 0 },
        { value: 'lethargic', label: 'Lethargic but responsive', score: 1 },
        { value: 'stuporous', label: 'Stuporous (difficult to arouse)', score: 2 },
        { value: 'unresponsive', label: 'Unresponsive', score: 3 }
      ]
    },
    {
      id: 'respiratory-1',
      title: 'Respiratory Rate',
      description: 'Breaths per minute',
      category: 'Respiratory',
      ageGroup: 'all',
      options: [
        { value: 'normal', label: '12-20 breaths/min (normal)', score: 0 },
        { value: 'mild-tachy', label: '21-30 breaths/min (mild tachypnea)', score: 1 },
        { value: 'moderate-tachy', label: '31-40 breaths/min (moderate tachypnea)', score: 2 },
        { value: 'severe-tachy', label: '>40 breaths/min (severe tachypnea)', score: 3 }
      ]
    },
    {
      id: 'cardiovascular-1',
      title: 'Heart Rate',
      description: 'Beats per minute',
      category: 'Cardiovascular',
      ageGroup: 'all',
      options: [
        { value: 'normal-hr', label: '60-100 bpm (normal)', score: 0 },
        { value: 'mild-tachy-hr', label: '101-120 bpm (mild tachycardia)', score: 1 },
        { value: 'moderate-tachy-hr', label: '121-150 bpm (moderate tachycardia)', score: 2 },
        { value: 'severe-tachy-hr', label: '>150 bpm (severe tachycardia)', score: 3 }
      ]
    },
    // Adult-specific question
    {
      id: 'adult-pain',
      title: 'Pain Assessment (Adult)',
      description: 'Patient self-reported pain level (0-10 scale)',
      category: 'Pain Assessment',
      ageGroup: 'adult',
      options: [
        { value: 'no-pain', label: '0 - No pain', score: 0 },
        { value: 'mild-pain', label: '1-3 - Mild pain', score: 1 },
        { value: 'moderate-pain', label: '4-6 - Moderate pain', score: 2 },
        { value: 'severe-pain', label: '7-10 - Severe pain', score: 3 }
      ]
    },
    // Pediatric-specific questions
    {
      id: 'pediatric-pain',
      title: 'Pediatric Pain Assessment',
      description: 'FLACC scale or age-appropriate pain assessment',
      category: 'Pain Assessment',
      ageGroup: 'pediatric',
      options: [
        { value: 'comfortable', label: 'Comfortable, no distress', score: 0 },
        { value: 'mild-distress', label: 'Mild distress or discomfort', score: 1 },
        { value: 'moderate-distress', label: 'Moderate distress', score: 2 },
        { value: 'severe-distress', label: 'Severe distress or inconsolable', score: 3 }
      ]
    },
    {
      id: 'pediatric-development',
      title: 'Developmental Response',
      description: 'Age-appropriate developmental responses',
      category: 'Developmental',
      ageGroup: 'pediatric',
      options: [
        { value: 'age-appropriate', label: 'Age-appropriate responses', score: 0 },
        { value: 'mildly-delayed', label: 'Mildly delayed responses', score: 1 },
        { value: 'significantly-delayed', label: 'Significantly delayed responses', score: 2 },
        { value: 'no-response', label: 'No developmental responses', score: 3 }
      ]
    }
  ];

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

  const handleAnswerChange = (questionId: string, value: string, score: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: { questionId, value, score }
    }));
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

  const handleReset = () => {
    setAnswers({});
    setShowResults(false);
    setPatientData({ patientId: '', age: '', name: '' });
    toast({
      title: "Assessment Reset",
      description: "All data has been cleared.",
    });
  };

  const categories = useMemo(() => {
    const cats = Array.from(new Set(relevantQuestions.map(q => q.category)));
    return cats;
  }, [relevantQuestions]);

  return (
    <div className="min-h-screen bg-gradient-assessment p-4 space-y-6">
      <header className="text-center py-6">
        <h1 className="text-3xl font-bold text-primary mb-2">
          Acuity Patient Assessment System
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Comprehensive patient assessment with age-dependent scoring for clinical decision support
        </p>
      </header>

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Patient Demographics */}
        <PatientDemographics
          patientData={patientData}
          onPatientDataChange={setPatientData}
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
            <CardContent className="space-y-6">
              {categories.map((category) => (
                <div key={category}>
                  <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <div className="w-1 h-6 bg-primary rounded-full"></div>
                    {category}
                  </h3>
                  <div className="grid gap-4">
                    {relevantQuestions
                      .filter(q => q.category === category)
                      .map((question) => (
                        <AssessmentQuestion
                          key={question.id}
                          id={question.id}
                          title={question.title}
                          description={question.description}
                          options={question.options}
                          selectedValue={answers[question.id]?.value || ''}
                          onValueChange={handleAnswerChange}
                          category={question.category}
                          isRequired={question.isRequired}
                        />
                      ))}
                  </div>
                  {category !== categories[categories.length - 1] && (
                    <Separator className="my-6" />
                  )}
                </div>
              ))}
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
          <AssessmentResults
            patientData={patientData}
            answers={answers}
            totalScore={totalScore}
            categories={categories}
            questions={relevantQuestions}
          />
        )}
      </div>
    </div>
  );
};