import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { TrendingUp, User, Calendar, Hash, Download, AlertTriangle, CheckCircle } from 'lucide-react';

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

interface AssessmentResultsProps {
  patientData: PatientData;
  answers: Record<string, AssessmentAnswer>;
  totalScore: number;
  categories: string[];
  questions: AssessmentQuestionData[];
}

export const AssessmentResults: React.FC<AssessmentResultsProps> = ({
  patientData,
  answers,
  totalScore,
  categories,
  questions
}) => {
  const getScoreInterpretation = (score: number) => {
    if (score <= 3) return { level: 'Low', color: 'text-green-600', bg: 'bg-green-50', description: 'Stable condition, routine monitoring' };
    if (score <= 6) return { level: 'Moderate', color: 'text-yellow-600', bg: 'bg-yellow-50', description: 'Requires increased monitoring' };
    if (score <= 9) return { level: 'High', color: 'text-orange-600', bg: 'bg-orange-50', description: 'Frequent monitoring needed' };
    return { level: 'Critical', color: 'text-red-600', bg: 'bg-red-50', description: 'Immediate attention required' };
  };

  const getCategoryScores = () => {
    return categories.map(category => {
      const categoryQuestions = questions.filter(q => q.category === category);
      const categoryScore = categoryQuestions.reduce((sum, question) => {
        const answer = answers[question.id];
        return sum + (answer?.score || 0);
      }, 0);
      const maxPossible = categoryQuestions.length * 3; // Assuming max score is 3 per question
      
      return {
        category,
        score: categoryScore,
        maxPossible,
        percentage: Math.round((categoryScore / maxPossible) * 100)
      };
    });
  };

  const interpretation = getScoreInterpretation(totalScore);
  const categoryScores = getCategoryScores();
  const maxPossibleTotal = questions.length * 3;
  const overallPercentage = Math.round((totalScore / maxPossibleTotal) * 100);

  const handleExport = () => {
    const reportData = {
      timestamp: new Date().toISOString(),
      patient: patientData,
      totalScore,
      interpretation: interpretation.level,
      categoryBreakdown: categoryScores,
      detailedAnswers: Object.values(answers).map(answer => {
        const question = questions.find(q => q.id === answer.questionId);
        const option = question?.options.find(opt => opt.value === answer.value);
        return {
          question: question?.title,
          category: question?.category,
          answer: option?.label,
          score: answer.score
        };
      })
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `assessment-${patientData.patientId}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Overall Results */}
      <Card className="shadow-elevated bg-gradient-score border-primary/20">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-primary text-xl">
            <TrendingUp className="h-6 w-6" />
            Assessment Results
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Patient Info Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-white/50 rounded-lg">
            <div className="flex items-center gap-2">
              <Hash className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">ID:</span>
              <span className="font-medium">{patientData.patientId}</span>
            </div>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Name:</span>
              <span className="font-medium">{patientData.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Age:</span>
              <span className="font-medium">{patientData.age} years</span>
              <Badge variant="outline" className="text-xs">
                {typeof patientData.age === 'number' && patientData.age < 14 ? 'Pediatric' : 'Adult'}
              </Badge>
            </div>
          </div>

          {/* Score Display */}
          <div className="text-center py-6">
            <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full ${interpretation.bg} border-2 border-current mb-4`}>
              <span className={`text-3xl font-bold ${interpretation.color}`}>
                {totalScore}
              </span>
            </div>
            <h3 className={`text-2xl font-bold ${interpretation.color} mb-2`}>
              {interpretation.level} Acuity
            </h3>
            <p className="text-muted-foreground mb-2">
              {interpretation.description}
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <span>Score: {totalScore} / {maxPossibleTotal}</span>
              <span>•</span>
              <span>{overallPercentage}% of maximum</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Breakdown */}
      <Card className="shadow-card-custom">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            Category Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {categoryScores.map((categoryData, index) => (
              <div key={categoryData.category} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{categoryData.category}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {categoryData.score}/{categoryData.maxPossible}
                    </span>
                    <Badge variant={categoryData.percentage > 50 ? "destructive" : categoryData.percentage > 25 ? "secondary" : "outline"}>
                      {categoryData.percentage}%
                    </Badge>
                  </div>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-500 ${
                      categoryData.percentage > 50 ? 'bg-destructive' : 
                      categoryData.percentage > 25 ? 'bg-yellow-500' : 'bg-primary'
                    }`}
                    style={{ width: `${categoryData.percentage}%` }}
                  />
                </div>
                {index < categoryScores.length - 1 && <Separator className="mt-4" />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Answers */}
      <Card className="shadow-card-custom">
        <CardHeader>
          <CardTitle>Detailed Assessment Responses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.values(answers).map((answer) => {
              const question = questions.find(q => q.id === answer.questionId);
              const option = question?.options.find(opt => opt.value === answer.value);
              
              return (
                <div key={answer.questionId} className="flex items-start justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-sm mb-1">{question?.title}</div>
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-green-600" />
                      {option?.label}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {question?.category}
                    </Badge>
                    <Badge variant={answer.score === 0 ? "outline" : answer.score <= 1 ? "secondary" : "destructive"}>
                      {answer.score}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card className="shadow-card-custom">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Assessment completed at {new Date().toLocaleString()}
            </div>
            <Button onClick={handleExport} className="gap-2">
              <Download className="h-4 w-4" />
              Export Report
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};