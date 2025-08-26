-- Create assessments table to store assessment sessions
CREATE TABLE public.assessments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  patient_name TEXT NOT NULL,
  patient_age INTEGER NOT NULL,
  patient_gender TEXT NOT NULL,
  total_score NUMERIC DEFAULT 0,
  assessment_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create assessment_answers table to store individual question responses
CREATE TABLE public.assessment_answers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  assessment_id UUID NOT NULL REFERENCES public.assessments(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL,
  question_title TEXT NOT NULL,
  category TEXT NOT NULL,
  selected_value TEXT NOT NULL,
  selected_label TEXT NOT NULL,
  selected_score NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_answers ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for assessments table
CREATE POLICY "Users can view their own assessments" 
ON public.assessments 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own assessments" 
ON public.assessments 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own assessments" 
ON public.assessments 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create RLS policies for assessment_answers table
CREATE POLICY "Users can view their own assessment answers" 
ON public.assessment_answers 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.assessments 
  WHERE assessments.id = assessment_answers.assessment_id 
  AND assessments.user_id = auth.uid()
));

CREATE POLICY "Users can create their own assessment answers" 
ON public.assessment_answers 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.assessments 
  WHERE assessments.id = assessment_answers.assessment_id 
  AND assessments.user_id = auth.uid()
));

-- Create indexes for better performance
CREATE INDEX idx_assessments_user_id ON public.assessments(user_id);
CREATE INDEX idx_assessments_date ON public.assessments(assessment_date DESC);
CREATE INDEX idx_assessment_answers_assessment_id ON public.assessment_answers(assessment_id);

-- Create trigger for automatic timestamp updates on assessments
CREATE TRIGGER update_assessments_updated_at
BEFORE UPDATE ON public.assessments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add foreign key constraint to link assessments with user profiles
ALTER TABLE public.assessments 
ADD CONSTRAINT fk_assessments_user_id 
FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;