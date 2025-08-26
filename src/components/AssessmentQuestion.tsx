import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2 } from 'lucide-react';

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
    <Card className={`shadow-card-custom transition-all duration-300 border-2 ${
      isAnswered 
        ? 'border-assessment-complete bg-assessment-complete' 
        : 'border-border hover:border-primary/30'
    }`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              {isAnswered && <CheckCircle2 className="h-4 w-4 text-assessment-complete-foreground" />}
              {title}
              {isRequired && <span className="text-destructive">*</span>}
            </CardTitle>
            {description && (
              <p className="text-sm text-muted-foreground mt-1">{description}</p>
            )}
          </div>
          <Badge variant="secondary" className="ml-2 text-xs">
            {category}
          </Badge>
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

        {isAnswered && selectedOption && (
          <div className="mt-4 p-3 bg-primary-light rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <span className="text-primary font-medium">Selected Score:</span>
              <span className="font-mono font-bold text-primary">{selectedOption.score}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};