import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp, Calendar, User, Trophy, Edit, RefreshCw, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAssessmentStorage } from '@/hooks/useAssessmentStorage';
import { Skeleton } from '@/components/ui/skeleton';
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

export const AssessmentHistory: React.FC = () => {
  const [assessments, setAssessments] = useState<SavedAssessment[]>([]);
  const [expandedAssessment, setExpandedAssessment] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { getAssessmentHistory, isLoading } = useAssessmentStorage();
  const navigate = useNavigate();

  useEffect(() => {
    loadAssessmentHistory();
  }, []);

  const loadAssessmentHistory = async () => {
    try {
      const history = await getAssessmentHistory();
      setAssessments(history);
    } catch (error) {
      toast({
        title: "Error loading history",
        description: "Failed to load assessment history. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadAssessmentHistory();
    setIsRefreshing(false);
    toast({
      title: "History refreshed",
      description: "Assessment history has been updated.",
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLevel = (score: number) => {
    if (score <= 3) return { level: 'Low', color: 'bg-green-100 text-green-800' };
    if (score <= 6) return { level: 'Moderate', color: 'bg-yellow-100 text-yellow-800' };
    if (score <= 9) return { level: 'High', color: 'bg-orange-100 text-orange-800' };
    return { level: 'Critical', color: 'bg-red-100 text-red-800' };
  };

  const groupAnswersByCategory = (answers: SavedAssessment['answers']) => {
    const grouped = answers.reduce((acc, answer) => {
      if (!acc[answer.category]) {
        acc[answer.category] = [];
      }
      acc[answer.category].push(answer);
      return acc;
    }, {} as Record<string, typeof answers>);
    
    return Object.entries(grouped);
  };

  const handleEditAssessment = (e: React.MouseEvent, assessmentId: string) => {
    e.stopPropagation();
    
    // Show confirmation toast
    toast({
      title: "Loading assessment for editing",
      description: "Please wait while we load the assessment data...",
    });
    
    // Navigate to edit mode
    navigate(`/assessment?edit=${assessmentId}`);
  };

  if (isLoading && assessments.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Assessment History</h2>
          <Button variant="outline" size="sm" disabled>
            <RefreshCw className="h-4 w-4 animate-spin" />
          </Button>
        </div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (assessments.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-xl font-semibold mb-2">No Assessments Yet</h3>
        <p className="text-muted-foreground mb-4">
          Complete your first assessment to see your history here.
        </p>
        <Button onClick={handleRefresh} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="h-6 w-6" />
          <h2 className="text-2xl font-bold">Assessment History</h2>
          <Badge variant="secondary" className="ml-2">
            {assessments.length} {assessments.length === 1 ? 'Assessment' : 'Assessments'}
          </Badge>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      <div className="space-y-4">
        {assessments.map((assessment) => {
          const scoreLevel = getScoreLevel(assessment.total_score);
          
          return (
            <Card key={assessment.id} className="border-l-4 border-l-primary hover:shadow-lg transition-shadow">
              <Collapsible
                open={expandedAssessment === assessment.id}
                onOpenChange={(open) => 
                  setExpandedAssessment(open ? assessment.id : null)
                }
              >
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <CardTitle className="text-lg">{assessment.patient_name}</CardTitle>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{assessment.patient_age} years old</span>
                          <Separator orientation="vertical" className="h-4" />
                          <span className="capitalize">{assessment.patient_gender}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Trophy className="h-4 w-4" />
                          <span className={`font-bold text-lg ${getScoreColor(assessment.total_score)}`}>
                            {assessment.total_score}
                          </span>
                          <Badge className={`text-xs ${scoreLevel.color}`}>
                            {scoreLevel.level}
                          </Badge>
                        </div>
                        
                        <div className="text-sm text-muted-foreground">
                          {formatDate(assessment.assessment_date)}
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => handleEditAssessment(e, assessment.id)}
                          className="h-8 w-8 p-0 hover:bg-primary/10"
                          title="Edit this assessment"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        
                        {expandedAssessment === assessment.id ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </div>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <CardContent className="pt-0">
                    <Separator className="mb-4" />
                    
                    <div className="space-y-6">
                      {groupAnswersByCategory(assessment.answers).map(([category, answers]) => (
                        <div key={category} className="space-y-3">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs font-semibold">
                              {category}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {answers.length} {answers.length === 1 ? 'question' : 'questions'}
                            </span>
                          </div>
                          
                          <div className="grid gap-3 pl-4">
                            {answers.map((answer, index) => (
                              <div key={`${answer.question_id}-${index}`} 
                                   className="flex items-start justify-between p-3 bg-muted/30 rounded-lg">
                                <div className="flex-1">
                                  <p className="font-medium text-sm mb-1">
                                    {answer.question_title}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {answer.selected_label}
                                  </p>
                                </div>
                                <Badge variant="secondary" className="text-xs font-mono">
                                  {answer.selected_score}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          );
        })}
      </div>
    </div>
  );
};