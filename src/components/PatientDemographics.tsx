import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Calendar, Hash, Users } from 'lucide-react';
import { useAssessmentData } from '@/hooks/useAssessmentData';

interface PatientDemographicsProps {
  patientData: {
    patientId: string;
    age: number | '';
    name: string;
    gender?: string;
    unit_id?: string;
    room_id?: string;
    bed_id?: string;
  };
  onPatientDataChange: (data: { patientId: string; age: number | ''; name: string; gender?: string; unit_id?: string; room_id?: string; bed_id?: string }) => void;
}

export const PatientDemographics: React.FC<PatientDemographicsProps> = ({
  patientData,
  onPatientDataChange
}) => {
  const { units, roomsByUnit, bedsByRoom } = useAssessmentData();
  const handleChange = (field: keyof typeof patientData, value: string | number) => {
    onPatientDataChange({
      ...patientData,
      [field]: value
    });
  };

  const handleUnitChange = (unitId: string) => {
    // Reset dependent fields when unit changes
    onPatientDataChange({ ...patientData, unit_id: unitId, room_id: '', bed_id: '' });
  };

  const handleRoomChange = (roomId: string) => {
    // Reset bed when room changes
    onPatientDataChange({ ...patientData, room_id: roomId, bed_id: '' });
  };

  const handleBedChange = (bedId: string) => {
    onPatientDataChange({ ...patientData, bed_id: bedId });
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

          <div className="space-y-2">
            <Label htmlFor="gender" className="flex items-center gap-2 text-sm font-medium">
              <Users className="h-4 w-4" />
              Gender
            </Label>
            <Select
              value={patientData.gender || ''}
              onValueChange={(value) => handleChange('gender', value)}
            >
              <SelectTrigger className="transition-all duration-200 focus:shadow-medical">
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other</SelectItem>
                <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {/* Unit selector */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium">Unit</Label>
            <Select value={patientData.unit_id || ''} onValueChange={handleUnitChange}>
              <SelectTrigger className="transition-all duration-200 focus:shadow-medical">
                <SelectValue placeholder="Select unit" />
              </SelectTrigger>
              <SelectContent>
                {(units || []).length === 0 ? (
                  <SelectItem disabled value="no-units">No units available</SelectItem>
                ) : (units || []).map((u) => (
                  <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {/* Room selector */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium">Room</Label>
            <Select value={patientData.room_id || ''} onValueChange={handleRoomChange} disabled={!patientData.unit_id}>
              <SelectTrigger className="transition-all duration-200 focus:shadow-medical">
                <SelectValue placeholder="Select room" />
              </SelectTrigger>
              <SelectContent>
                {(patientData.unit_id ? (roomsByUnit[patientData.unit_id] || []) : []).length === 0 ? (
                  <SelectItem disabled value="no-rooms">No rooms</SelectItem>
                ) : (patientData.unit_id ? (roomsByUnit[patientData.unit_id] || []) : []).map((r) => (
                  <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {/* Bed selector */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium">Bed</Label>
            <Select value={patientData.bed_id || ''} onValueChange={handleBedChange} disabled={!patientData.room_id}>
              <SelectTrigger className="transition-all duration-200 focus:shadow-medical">
                <SelectValue placeholder="Select bed" />
              </SelectTrigger>
              <SelectContent>
                {(patientData.room_id ? (bedsByRoom[patientData.room_id] || []) : []).length === 0 ? (
                  <SelectItem disabled value="no-beds">No beds</SelectItem>
                ) : (patientData.room_id ? (bedsByRoom[patientData.room_id] || []) : []).map((b) => (
                  <SelectItem key={b.id} value={b.id}>{b.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
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