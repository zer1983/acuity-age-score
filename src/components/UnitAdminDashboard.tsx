import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { DoorOpen, Bed, Plus, Edit, Trash2, UserCheck, FileText } from 'lucide-react';
import { useAssessmentData } from '@/hooks/useAssessmentData';
import { usePatientData } from '@/hooks/usePatientData';
import { useUserRole } from '@/hooks/useUserRole';
// import { Patient } from '@/types/assessment';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

// interface RoomFormData {
//   unit_id: string;
//   name: string;
//   room_number: string;
//   room_type: string;
//   capacity: number;
// }

// interface BedFormData {
//   room_id: string;
//   label: string;
//   bed_number: string;
//   bed_type: string;
//   is_occupied: boolean;
// }

interface PatientFormData {
  patient_id: string;
  name: string;
  age: number;
  gender: string;
  unit_id: string;
  room_id: string;
  bed_id: string;
  admission_date: string;
  status: 'active' | 'discharged';
}

export const UnitAdminDashboard: React.FC = () => {
  const { units, rooms, beds, roomsByUnit, bedsByRoom } = useAssessmentData();
  const { patients, createPatient, updatePatient, deletePatient } = usePatientData();
  const { getUserUnitId } = useUserRole();
  const [isLoading, setIsLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState<'room' | 'bed' | 'patient' | null>(null);
  const [editingItem, setEditingItem] = useState<Record<string, unknown> | null>(null);
  
  const userUnitId = getUserUnitId();
  const userUnit = units.find(unit => unit.id === userUnitId);
  const unitRooms = roomsByUnit[userUnitId || ''] || [];
  const unitPatients = patients.filter(p => p.unit_id === userUnitId);

  // const [roomForm, setRoomForm] = useState<RoomFormData>({
  //   unit_id: userUnitId || '',
  //   name: '',
  //   room_number: '',
  //   room_type: 'standard',
  //   capacity: 1
  // });

  // const [bedForm, setBedForm] = useState<BedFormData>({
  //   room_id: '',
  //   label: '',
  //   bed_number: '',
  //   bed_type: 'standard',
  //   is_occupied: false
  // });

  const [patientForm, setPatientForm] = useState<PatientFormData>({
    patient_id: '',
    name: '',
    age: 0,
    gender: 'Male',
    unit_id: userUnitId || '',
    room_id: '',
    bed_id: '',
    admission_date: new Date().toISOString().split('T')[0],
    status: 'active'
  });

  const resetForms = () => {
    setRoomForm({ unit_id: userUnitId || '', name: '', room_number: '', room_type: 'standard', capacity: 1 });
    setBedForm({ room_id: '', label: '', bed_number: '', bed_type: 'standard', is_occupied: false });
    setPatientForm({ 
      patient_id: '', name: '', age: 0, gender: 'Male', unit_id: userUnitId || '', room_id: '', bed_id: '', 
      admission_date: new Date().toISOString().split('T')[0], status: 'active' 
    });
    setEditingItem(null);
  };

  // const handleSaveRoom = async () => {
  //   setIsLoading(true);
  //   try {
  //     if (editingItem) {
  //       const { error } = await supabase
  //         .from('rooms')
  //         .update(roomForm)
  //         .eq('id', editingItem.id);
  //       if (error) throw error;
  //       toast({ title: "Room updated successfully!" });
  //     } else {
  //       const { error } = await supabase
  //         .from('rooms')
  //         .insert([roomForm]);
  //       if (error) throw error;
  //       toast({ title: "Room created successfully!" });
  //     }
  //     setOpenDialog(null);
  //     resetForms();
  //     window.location.reload();
  //   } catch (error) {
  //     toast({ title: "Error", description: "Failed to save room", variant: "destructive" });
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  // const handleSaveBed = async () => {
  //   setIsLoading(true);
  //   try {
  //     if (editingItem) {
  //       const { error } = await supabase
  //         .from('beds')
  //         .update(bedForm)
  //         .eq('id', editingItem.id);
  //       if (error) throw error;
  //       toast({ title: "Bed updated successfully!" });
  //     } else {
  //       const { error } = await supabase
  //         .from('beds')
  //         .insert([bedForm]);
  //       if (error) throw error;
  //       toast({ title: "Bed created successfully!" });
  //     }
  //     setOpenDialog(null);
  //     resetForms();
  //     window.location.reload();
  //   } catch (error) {
  //     toast({ title: "Error", description: "Failed to save bed", variant: "destructive" });
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const handleSavePatient = async () => {
    setIsLoading(true);
    try {
      if (editingItem) {
        const result = await updatePatient(editingItem.id, patientForm);
        if (result.error) throw new Error(result.error);
        toast({ title: "Patient updated successfully!" });
      } else {
        const result = await createPatient(patientForm);
        if (result.error) throw new Error(result.error);
        toast({ title: "Patient created successfully!" });
      }
      setOpenDialog(null);
      resetForms();
    } catch {
      toast({ title: "Error", description: "Failed to save patient", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (type: 'room' | 'bed' | 'patient', id: string) => {
    if (!confirm(`Are you sure you want to delete this ${type}? This action cannot be undone.`)) return;
    
    setIsLoading(true);
    try {
      if (type === 'patient') {
        const result = await deletePatient(id);
        if (result.error) throw new Error(result.error);
      } else {
        const tableName = type === 'room' ? 'rooms' : 'beds';
        const { error } = await supabase
          .from(tableName)
          .delete()
          .eq('id', id);
        
        if (error) throw error;
        window.location.reload();
      }
      toast({ title: `${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully!` });
    } catch {
      toast({ title: "Error", description: `Failed to delete ${type}`, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const openEditDialog = (type: 'room' | 'bed' | 'patient', item: Record<string, unknown>) => {
    setEditingItem(item);
    
    if (type === 'room') {
      setRoomForm({
        unit_id: item.unit_id,
        name: item.name,
        room_number: item.room_number,
        room_type: item.room_type,
        capacity: item.capacity
      });
    } else if (type === 'bed') {
      setBedForm({
        room_id: item.room_id,
        label: item.label,
        bed_number: item.bed_number,
        bed_type: item.bed_type,
        is_occupied: item.is_occupied
      });
    } else if (type === 'patient') {
      setPatientForm({
        patient_id: item.patient_id,
        name: item.name,
        age: item.age,
        gender: item.gender,
        unit_id: item.unit_id || userUnitId || '',
        room_id: item.room_id || '',
        bed_id: item.bed_id || '',
        admission_date: item.admission_date,
        status: item.status || 'active'
      });
    }
    
    setOpenDialog(type);
  };

  if (!userUnit) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-lg text-gray-600 dark:text-gray-400">
            No unit assigned to your profile. Please contact your administrator.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <DoorOpen className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {userUnit.name} - Unit Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your unit's infrastructure and patients
          </p>
        </div>
      </div>

      {/* Unit Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DoorOpen className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Rooms</p>
                <p className="text-2xl font-bold">{unitRooms.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Bed className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Beds</p>
                <p className="text-2xl font-bold">
                  {unitRooms.reduce((total, room) => total + (bedsByRoom[room.id]?.length || 0), 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <UserCheck className="h-8 w-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Patients</p>
                <p className="text-2xl font-bold">{unitPatients.filter(p => p.status === 'active').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-orange-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Occupancy</p>
                <p className="text-2xl font-bold">
                  {unitRooms.reduce((total, room) => total + (bedsByRoom[room.id]?.length || 0), 0) > 0 
                    ? Math.round((unitPatients.filter(p => p.status === 'active').length / unitRooms.reduce((total, room) => total + (bedsByRoom[room.id]?.length || 0), 0)) * 100)
                    : 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="patients" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="patients" className="flex items-center gap-2">
            <UserCheck className="h-4 w-4" />
            Patients
          </TabsTrigger>
          <TabsTrigger value="rooms" className="flex items-center gap-2">
            <DoorOpen className="h-4 w-4" />
            Rooms
          </TabsTrigger>
          <TabsTrigger value="beds" className="flex items-center gap-2">
            <Bed className="h-4 w-4" />
            Beds
          </TabsTrigger>
        </TabsList>

        {/* Patients Tab */}
        <TabsContent value="patients">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Unit Patients</CardTitle>
                <Dialog open={openDialog === 'patient'} onOpenChange={(open) => !open && setOpenDialog(null)}>
                  <DialogTrigger asChild>
                    <Button onClick={() => { resetForms(); setOpenDialog('patient'); }}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Patient
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>{editingItem ? 'Edit Patient' : 'Add New Patient'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="patient-id">Patient ID</Label>
                          <Input
                            id="patient-id"
                            value={patientForm.patient_id}
                            onChange={(e) => setPatientForm({...patientForm, patient_id: e.target.value})}
                            placeholder="e.g., P001"
                          />
                        </div>
                        <div>
                          <Label htmlFor="patient-name">Patient Name</Label>
                          <Input
                            id="patient-name"
                            value={patientForm.name}
                            onChange={(e) => setPatientForm({...patientForm, name: e.target.value})}
                            placeholder="Full name"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="patient-age">Age</Label>
                          <Input
                            id="patient-age"
                            type="number"
                            value={patientForm.age}
                            onChange={(e) => setPatientForm({...patientForm, age: parseInt(e.target.value) || 0})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="patient-gender">Gender</Label>
                          <Select value={patientForm.gender} onValueChange={(value) => setPatientForm({...patientForm, gender: value})}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Male">Male</SelectItem>
                              <SelectItem value="Female">Female</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="admission-date">Admission Date</Label>
                          <Input
                            id="admission-date"
                            type="date"
                            value={patientForm.admission_date}
                            onChange={(e) => setPatientForm({...patientForm, admission_date: e.target.value})}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="patient-room">Room</Label>
                          <Select value={patientForm.room_id} onValueChange={(value) => setPatientForm({...patientForm, room_id: value, bed_id: ''})} disabled={!unitRooms.length}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select room" />
                            </SelectTrigger>
                            <SelectContent>
                              {unitRooms.map((room) => (
                                <SelectItem key={room.id} value={room.id}>{room.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="patient-bed">Bed</Label>
                          <Select value={patientForm.bed_id} onValueChange={(value) => setPatientForm({...patientForm, bed_id: value})} disabled={!patientForm.room_id}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select bed" />
                            </SelectTrigger>
                            <SelectContent>
                              {(bedsByRoom[patientForm.room_id] || []).map((bed) => (
                                <SelectItem key={bed.id} value={bed.id}>{bed.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setOpenDialog(null)}>Cancel</Button>
                        <Button onClick={handleSavePatient} disabled={isLoading}>
                          {isLoading ? 'Saving...' : (editingItem ? 'Update' : 'Create')}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Age</TableHead>
                    <TableHead>Gender</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {unitPatients.map((patient) => (
                    <TableRow key={patient.id}>
                      <TableCell className="font-medium">{patient.patient_id}</TableCell>
                      <TableCell>{patient.name}</TableCell>
                      <TableCell>{patient.age}</TableCell>
                      <TableCell>{patient.gender}</TableCell>
                      <TableCell>
                        {patient.room_id && patient.bed_id ? (
                          <span className="text-sm">
                            Room {rooms.find(r => r.id === patient.room_id)?.name} - 
                            Bed {beds.find(b => b.id === patient.bed_id)?.label}
                          </span>
                        ) : 'Not assigned'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={patient.status === 'active' ? "default" : "secondary"}>
                          {patient.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => openEditDialog('patient', patient)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDelete('patient', patient.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rooms Tab */}
        <TabsContent value="rooms">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Unit Rooms</CardTitle>
                <Button onClick={() => { resetForms(); setOpenDialog('room'); }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Room
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Room Name</TableHead>
                    <TableHead>Room Number</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Capacity</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {unitRooms.map((room) => (
                    <TableRow key={room.id}>
                      <TableCell className="font-medium">{room.name}</TableCell>
                      <TableCell>{room.room_number}</TableCell>
                      <TableCell>{room.room_type}</TableCell>
                      <TableCell>{room.capacity}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => openEditDialog('room', room)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDelete('room', room.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Beds Tab */}
        <TabsContent value="beds">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Unit Beds</CardTitle>
                <Button onClick={() => { resetForms(); setOpenDialog('bed'); }} disabled={unitRooms.length === 0}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Bed
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {unitRooms.length === 0 ? (
                <p className="text-center text-gray-500 py-8">Create rooms first before adding beds</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Bed Label</TableHead>
                      <TableHead>Room</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {unitRooms.flatMap(room => 
                      (bedsByRoom[room.id] || []).map(bed => (
                        <TableRow key={bed.id}>
                          <TableCell className="font-medium">{bed.label}</TableCell>
                          <TableCell>{room.name}</TableCell>
                          <TableCell>{bed.bed_type}</TableCell>
                          <TableCell>
                            <Badge variant={bed.is_occupied ? "destructive" : "default"}>
                              {bed.is_occupied ? "Occupied" : "Available"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" onClick={() => openEditDialog('bed', bed)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => handleDelete('bed', bed.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};