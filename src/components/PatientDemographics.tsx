import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Calendar, Hash } from 'lucide-react';

interface PatientDemographicsProps {
  patientData: {
    patientId: string;
    age: number | '';
    name: string;
  };
  onPatientDataChange: (data: { patientId: string; age: number | ''; name: string }) => void;
}

export const PatientDemographics: React.FC<PatientDemographicsProps> = ({
  patientData,
  onPatientDataChange
}) => {
  const handleChange = (field: keyof typeof patientData, value: string | number) => {
    onPatientDataChange({
      ...patientData,
      [field]: value
    });
  };

  const getAgeCategory = () => {
    if (patientData.age === '' || patientData.age < 0) return '';
    return patientData.age < 14 ? 'Pediatric (<14 years)' : 'Adult (≥14 years)';
  };

  const ageCategory = getAgeCategory();

  return (
    <Card className="shadow-card-custom bg-gradient-assessment border-primary/20">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-primary">
          <User className="h-5 w-5" />
          Patient Demographics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="patientId" className="flex items-center gap-2 text-sm font-medium">
              <Hash className="h-4 w-4" />
              Patient ID
            </Label>
            <Input
              id="patientId"
              placeholder="Enter patient ID"
              value={patientData.patientId}
              onChange={(e) => handleChange('patientId', e.target.value)}
              className="transition-all duration-200 focus:shadow-medical"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-2 text-sm font-medium">
              <User className="h-4 w-4" />
              Patient Name
            </Label>
            <Input
              id="name"
              placeholder="Enter patient name"
              value={patientData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="transition-all duration-200 focus:shadow-medical"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="age" className="flex items-center gap-2 text-sm font-medium">
              <Calendar className="h-4 w-4" />
              Age (years)
            </Label>
            <Input
              id="age"
              type="number"
              min="0"
              max="150"
              placeholder="Enter age"
              value={patientData.age}
              onChange={(e) => handleChange('age', e.target.value ? parseInt(e.target.value) : '')}
              className="transition-all duration-200 focus:shadow-medical"
            />
          </div>
        </div>
        
        {ageCategory && (
          <div className="mt-4 p-3 bg-primary-light rounded-lg border-l-4 border-primary">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span className="text-sm font-medium text-primary">
                Age Category: {ageCategory}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};