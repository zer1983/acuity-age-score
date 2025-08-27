import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { TrendingUp, User, Calendar, Hash, Download, AlertTriangle, CheckCircle, Edit } from 'lucide-react';

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
  gender?: string;
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
  questions: AssessmentQuestionData[];
  isEditMode?: boolean;
}

export const AssessmentResults: React.FC<AssessmentResultsProps> = ({
  patientData,
  answers,
  totalScore,
  questions,
  isEditMode = false
}) => {
  const getScoreInterpretation = (score: number) => {
    if (score <= 3) return { level: 'Low', color: 'text-green-600', bg: 'bg-green-50', description: 'Stable condition, routine monitoring' };
    if (score <= 6) return { level: 'Moderate', color: 'text-yellow-600', bg: 'bg-yellow-50', description: 'Requires increased monitoring' };
    if (score <= 9) return { level: 'High', color: 'text-orange-600', bg: 'bg-orange-50', description: 'Frequent monitoring needed' };
    return { level: 'Critical', color: 'text-red-600', bg: 'bg-red-50', description: 'Immediate attention required' };
  };

  const getCategoryScores = () => {
    const categories = Array.from(new Set(questions.map(q => q.category)));
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
    a.download = `assessment-report-${patientData.name}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header with Edit Mode indicator */}
      <Card className="border-l-4 border-l-primary">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-6 w-6 text-primary" />
              <div>
                <CardTitle className="text-xl">
                  {isEditMode ? 'Updated Assessment Results' : 'Assessment Results'}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {isEditMode ? 'Results after your modifications' : 'Final assessment evaluation'}
                </p>
              </div>
            </div>
            {isEditMode && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Edit className="h-3 w-3" />
                Edit Mode
              </Badge>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Patient Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Patient Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <Hash className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Patient ID</p>
                <p className="text-sm text-muted-foreground">{patientData.patientId || 'Not specified'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Name</p>
                <p className="text-sm text-muted-foreground">{patientData.name || 'Not specified'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Age</p>
                <p className="text-sm text-muted-foreground">
                  {patientData.age !== '' ? `${patientData.age} years` : 'Not specified'}
                </p>
              </div>
            </div>
            {patientData.gender && (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Gender</p>
                  <p className="text-sm text-muted-foreground capitalize">{patientData.gender}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Score Summary */}
      <Card className={`${interpretation.bg} border-l-4 border-l-${interpretation.color.split('-')[1]}-500`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Score Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className={`text-4xl font-bold ${interpretation.color} mb-2`}>
                {totalScore}
              </div>
              <p className="text-sm font-medium">Total Score</p>
              <p className="text-xs text-muted-foreground">
                out of {maxPossibleTotal} ({overallPercentage}%)
              </p>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${interpretation.color} mb-2`}>
                {interpretation.level}
              </div>
              <p className="text-sm font-medium">Acuity Level</p>
              <p className="text-xs text-muted-foreground">
                {interpretation.description}
              </p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-muted-foreground mb-2">
                {Object.keys(answers).length}
              </div>
              <p className="text-sm font-medium">Questions Answered</p>
              <p className="text-xs text-muted-foreground">
                out of {questions.length} total
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Category Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {categoryScores.map((category) => (
              <div key={category.category} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium capitalize">{category.category}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono">
                      {category.score}/{category.maxPossible}
                    </span>
                    <Badge variant="outline">
                      {category.percentage}%
                    </Badge>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${category.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-center">
        <Button onClick={handleExport} className="gap-2">
          <Download className="h-4 w-4" />
          Export Results
        </Button>
      </div>
    </div>
  );
};