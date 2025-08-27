import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { UserNav } from '@/components/UserNav';
import { useAssessmentStorage } from '@/hooks/useAssessmentStorage';
import { useAuth } from '@/contexts/AuthContext';
import { 
  TrendingUp, 
  User, 
  Calendar, 
  Hash, 
  Download, 
  CheckCircle, 
  ArrowLeft, 
  Loader2,
  AlertTriangle,
  BarChart3,
  FileText,
  Home
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

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

const AssessmentSummary: React.FC = () => {
  const { assessmentId } = useParams<{ assessmentId: string }>();
  const navigate = useNavigate();
  const { getAssessmentById, isLoading } = useAssessmentStorage();
  const { profile } = useAuth();
  const [assessment, setAssessment] = useState<SavedAssessment | null>(null);

  const loadAssessment = useCallback(async () => {
    if (!assessmentId) return;
    
    try {
      const data = await getAssessmentById(assessmentId);
      if (data) {
        setAssessment(data);
      } else {
        toast({
          title: "Assessment not found",
          description: "The requested assessment could not be loaded.",
          variant: "destructive"
        });
        navigate('/assessment');
      }
    } catch (error) {
      console.error('Error loading assessment:', error);
      toast({
        title: "Error loading assessment",
        description: "An error occurred while loading the assessment.",
        variant: "destructive"
      });
      navigate('/assessment');
    }
  }, [assessmentId, getAssessmentById, navigate]);

  useEffect(() => {
    if (assessmentId) {
      loadAssessment();
    }
  }, [assessmentId, loadAssessment]);

  const getScoreInterpretation = (score: number) => {
    if (score <= 3) return { 
      level: 'Low', 
      color: 'text-green-600', 
      bg: 'bg-green-50 border-green-200', 
      description: 'Stable condition, routine monitoring recommended' 
    };
    if (score <= 6) return { 
      level: 'Moderate', 
      color: 'text-yellow-600', 
      bg: 'bg-yellow-50 border-yellow-200', 
      description: 'Requires increased monitoring and observation' 
    };
    if (score <= 9) return { 
      level: 'High', 
      color: 'text-orange-600', 
      bg: 'bg-orange-50 border-orange-200', 
      description: 'Frequent monitoring and intervention needed' 
    };
    return { 
      level: 'Critical', 
      color: 'text-red-600', 
      bg: 'bg-red-50 border-red-200', 
      description: 'Immediate attention and intervention required' 
    };
  };

  const getCategoryScores = () => {
    if (!assessment || !assessment.answers || !Array.isArray(assessment.answers)) return [];
    
    const categoryMap = new Map<string, { score: number; count: number }>();
    
    assessment.answers.forEach(answer => {
      if (answer && answer.category && typeof answer.selected_score === 'number') {
        const existing = categoryMap.get(answer.category) || { score: 0, count: 0 };
        categoryMap.set(answer.category, {
          score: existing.score + answer.selected_score,
          count: existing.count + 1
        });
      }
    });

    return Array.from(categoryMap.entries()).map(([category, data]) => {
      const maxPossible = data.count * 3; // Assuming max score is 3 per question
      const percentage = Math.round((data.score / maxPossible) * 100);
      
      return {
        category,
        score: data.score,
        maxPossible,
        percentage,
        questionCount: data.count
      };
    });
  };

  const handleExport = () => {
    if (!assessment) return;

    const reportData = {
      timestamp: new Date().toISOString(),
      assessmentId: assessment.id,
      assessmentDate: assessment.assessment_date,
      patient: {
        name: assessment.patient_name,
        age: assessment.patient_age,
        gender: assessment.patient_gender
      },
      totalScore: assessment.total_score,
      interpretation: getScoreInterpretation(assessment.total_score).level,
      categoryBreakdown: getCategoryScores(),
      detailedAnswers: assessment.answers
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `assessment-summary-${assessment.patient_name.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Report exported",
      description: "Assessment report has been downloaded successfully."
    });
  };

  if (isLoading || !assessment) {
    return (
      <div className="min-h-screen bg-gradient-assessment p-4 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="py-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading assessment summary...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Ensure assessment and answers exist before proceeding
  if (!assessment.answers || !Array.isArray(assessment.answers)) {
    return (
      <div className="min-h-screen bg-gradient-assessment p-4 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="py-8 text-center">
            <AlertTriangle className="h-8 w-8 mx-auto mb-4 text-red-500" />
            <h3 className="text-lg font-semibold mb-2">Assessment Data Error</h3>
            <p className="text-muted-foreground">Unable to load assessment data. Please try again.</p>
            <Button 
              onClick={() => navigate('/assessment')} 
              className="mt-4"
            >
              Back to Assessment
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const interpretation = getScoreInterpretation(assessment.total_score);
  const categoryScores = getCategoryScores();
  const maxPossibleTotal = assessment.answers.length * 3;
  const overallPercentage = Math.round((assessment.total_score / maxPossibleTotal) * 100);

  return (
    <div className="min-h-screen bg-gradient-assessment p-4 space-y-6">
      <header className="py-6">
        <div className="flex justify-between items-center max-w-6xl mx-auto">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => navigate('/')}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Assessment
            </Button>
            <div className="text-center">
              <h1 className="text-3xl font-bold text-primary mb-2">
                Assessment Summary
              </h1>
              <p className="text-muted-foreground">
                Comprehensive results and analysis
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => navigate('/')}
              className="gap-2"
            >
              <Home className="h-4 w-4" />
              New Assessment
            </Button>
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

      <div className="max-w-6xl mx-auto space-y-6">
        {/* Overall Results Header */}
        <Card className={`shadow-elevated border-2 ${interpretation.bg}`}>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-primary text-xl">
              <TrendingUp className="h-6 w-6" />
              Assessment Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Patient Info Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-white/70 rounded-lg">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Name:</span>
                <span className="font-medium">{assessment.patient_name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Age:</span>
                <span className="font-medium">{assessment.patient_age} years</span>
                <Badge variant="outline" className="text-xs">
                  {assessment.patient_age < 14 ? 'Pediatric' : 'Adult'}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Hash className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Gender:</span>
                <span className="font-medium">{assessment.patient_gender}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Date:</span>
                <span className="font-medium">
                  {new Date(assessment.assessment_date).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Score Display */}
            <div className="text-center py-8">
              <div className={`inline-flex items-center justify-center w-32 h-32 rounded-full ${interpretation.bg} border-4 border-current mb-6`}>
                <span className={`text-5xl font-bold ${interpretation.color}`}>
                  {assessment.total_score}
                </span>
              </div>
              <h2 className={`text-3xl font-bold ${interpretation.color} mb-3`}>
                {interpretation.level} Acuity Level
              </h2>
              <p className="text-lg text-muted-foreground mb-4">
                {interpretation.description}
              </p>
              <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                <span>Total Score: {assessment.total_score} / {maxPossibleTotal}</span>
                <span>•</span>
                <span>{overallPercentage}% of maximum possible</span>
                <span>•</span>
                <span>{assessment.answers.length} questions assessed</span>
              </div>
              
              {interpretation.level === 'Critical' && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2 text-red-600">
                    <AlertTriangle className="h-5 w-5" />
                    <span className="font-medium">Critical Alert</span>
                  </div>
                  <p className="text-sm text-red-600 mt-1">
                    This patient requires immediate medical attention and continuous monitoring.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Category Breakdown */}
          <Card className="shadow-card-custom">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <BarChart3 className="h-5 w-5" />
                Category Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {categoryScores.map((categoryData, index) => (
                  <div key={categoryData.category} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-medium text-base">{categoryData.category}</span>
                        <p className="text-sm text-muted-foreground">
                          {categoryData.questionCount} question{categoryData.questionCount !== 1 ? 's' : ''} assessed
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg font-semibold">
                            {categoryData.score}/{categoryData.maxPossible}
                          </span>
                          <Badge variant={
                            categoryData.percentage > 60 ? "destructive" : 
                            categoryData.percentage > 30 ? "secondary" : "outline"
                          }>
                            {categoryData.percentage}%
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="w-full bg-muted rounded-full h-3">
                      <div 
                        className={`h-3 rounded-full transition-all duration-700 ${
                          categoryData.percentage > 60 ? 'bg-destructive' : 
                          categoryData.percentage > 30 ? 'bg-yellow-500' : 'bg-primary'
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

          {/* Assessment Metadata */}
          <Card className="shadow-card-custom">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <FileText className="h-5 w-5" />
                Assessment Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-muted/30 rounded-lg">
                  <div className="text-2xl font-bold text-primary">{assessment.answers.length}</div>
                  <div className="text-sm text-muted-foreground">Total Questions</div>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg">
                  <div className="text-2xl font-bold text-primary">{categoryScores.length}</div>
                  <div className="text-sm text-muted-foreground">Categories</div>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <h4 className="font-medium">Assessment Completion Time</h4>
                <p className="text-sm text-muted-foreground">
                  {new Date(assessment.assessment_date).toLocaleString()}
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">Assessment ID</h4>
                <p className="text-sm font-mono text-muted-foreground">
                  {assessment.id}
                </p>
              </div>

              <Button onClick={handleExport} className="w-full gap-2 mt-4">
                <Download className="h-4 w-4" />
                Export Full Report
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Responses */}
        <Card className="shadow-card-custom">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5" />
              Detailed Assessment Responses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {assessment.answers && assessment.answers.map((answer, index) => (
                <div key={answer.question_id} className="flex items-start justify-between p-4 bg-muted/20 rounded-lg border">
                  <div className="flex-1">
                    <div className="flex items-start gap-3">
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded font-medium">
                        Q{index + 1}
                      </span>
                      <div>
                        <h4 className="font-medium text-sm mb-2 leading-relaxed">
                          {answer.question_title}
                        </h4>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <CheckCircle className="h-3 w-3 text-green-600" />
                          <span>{answer.selected_label}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 ml-4">
                    <Badge variant="outline" className="text-xs">
                      {answer.category}
                    </Badge>
                    <Badge variant={
                      answer.selected_score === 0 ? "outline" : 
                      answer.selected_score <= 1 ? "secondary" : "destructive"
                    } className="text-sm font-medium">
                      {answer.selected_score} pts
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AssessmentSummary;