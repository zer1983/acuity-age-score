import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock } from 'lucide-react';

interface QuestionOption {
  value: string;
  label: string;
  score: number;
}

interface AssessmentQuestionProps {
  id: string;
  title: string;
  description?: string;
  options: QuestionOption[];
  selectedValue: string;
  onValueChange: (questionId: string, value: string, score: number) => void;
  category: string;
  isRequired?: boolean;
}

export const AssessmentQuestion: React.FC<AssessmentQuestionProps> = ({
  id,
  title,
  description,
  options,
  selectedValue,
  onValueChange,
  category,
  isRequired = true
}) => {
  const isAnswered = selectedValue !== '';
  const selectedOption = options.find(opt => opt.value === selectedValue);

  return (
    <Card className={`shadow-card-custom transition-all duration-300 border-0 ${
      isAnswered 
        ? 'bg-green-50/50 dark:bg-green-950/30' 
        : 'hover:shadow-lg'
    }`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              {isAnswered ? (
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              ) : (
                <Clock className="h-4 w-4 text-orange-500" />
              )}
              {title}
              {isRequired && <span className="text-destructive">*</span>}
            </CardTitle>
            {description && (
              <p className="text-sm text-muted-foreground mt-1">{description}</p>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <RadioGroup
          value={selectedValue}
          onValueChange={(value) => {
            const option = options.find(opt => opt.value === value);
            if (option) {
              onValueChange(id, value, option.score);
            }
          }}
          className="space-y-3"
        >
          {options.map((option) => (
            <div key={option.value} className="flex items-center space-x-3">
              <RadioGroupItem 
                value={option.value} 
                id={`${id}-${option.value}`}
                className="text-primary"
              />
              <Label 
                htmlFor={`${id}-${option.value}`}
                className="flex-1 cursor-pointer text-sm leading-relaxed hover:text-primary transition-colors"
              >
                {option.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </CardContent>
    </Card>
  );
};