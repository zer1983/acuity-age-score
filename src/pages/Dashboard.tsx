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
import { UserNav } from '@/components/UserNav';
import { Building2, DoorOpen, Bed, Plus, Edit, Trash2, Settings } from 'lucide-react';
import { useAssessmentData } from '@/hooks/useAssessmentData';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface UnitFormData {
  name: string;
  description: string;
  floor_number: number;
  capacity: number;
}

interface RoomFormData {
  unit_id: string;
  name: string;
  room_number: string;
  room_type: string;
  capacity: number;
}

interface BedFormData {
  room_id: string;
  label: string;
  bed_number: string;
  bed_type: string;
  is_occupied: boolean;
}

export const Dashboard: React.FC = () => {
  const { units, rooms, beds, roomsByUnit, bedsByRoom } = useAssessmentData();
  const [isLoading, setIsLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState<'unit' | 'room' | 'bed' | null>(null);
  const [editingItem, setEditingItem] = useState<any>(null);
  
  const [unitForm, setUnitForm] = useState<UnitFormData>({
    name: '',
    description: '',
    floor_number: 1,
    capacity: 1
  });

  const [roomForm, setRoomForm] = useState<RoomFormData>({
    unit_id: '',
    name: '',
    room_number: '',
    room_type: 'standard',
    capacity: 1
  });

  const [bedForm, setBedForm] = useState<BedFormData>({
    room_id: '',
    label: '',
    bed_number: '',
    bed_type: 'standard',
    is_occupied: false
  });

  const resetForms = () => {
    setUnitForm({ name: '', description: '', floor_number: 1, capacity: 1 });
    setRoomForm({ unit_id: '', name: '', room_number: '', room_type: 'standard', capacity: 1 });
    setBedForm({ room_id: '', label: '', bed_number: '', bed_type: 'standard', is_occupied: false });
    setEditingItem(null);
  };

  const handleSaveUnit = async () => {
    setIsLoading(true);
    try {
      if (editingItem) {
        const { error } = await supabase
          .from('units')
          .update(unitForm)
          .eq('id', editingItem.id);
        if (error) throw error;
        toast({ title: "Unit updated successfully!" });
      } else {
        const { error } = await supabase
          .from('units')
          .insert([unitForm]);
        if (error) throw error;
        toast({ title: "Unit created successfully!" });
      }
      setOpenDialog(null);
      resetForms();
      window.location.reload(); // Refresh data
    } catch (error) {
      toast({ title: "Error", description: "Failed to save unit", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveRoom = async () => {
    setIsLoading(true);
    try {
      if (editingItem) {
        const { error } = await supabase
          .from('rooms')
          .update(roomForm)
          .eq('id', editingItem.id);
        if (error) throw error;
        toast({ title: "Room updated successfully!" });
      } else {
        const { error } = await supabase
          .from('rooms')
          .insert([roomForm]);
        if (error) throw error;
        toast({ title: "Room created successfully!" });
      }
      setOpenDialog(null);
      resetForms();
      window.location.reload();
    } catch (error) {
      toast({ title: "Error", description: "Failed to save room", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveBed = async () => {
    setIsLoading(true);
    try {
      if (editingItem) {
        const { error } = await supabase
          .from('beds')
          .update(bedForm)
          .eq('id', editingItem.id);
        if (error) throw error;
        toast({ title: "Bed updated successfully!" });
      } else {
        const { error } = await supabase
          .from('beds')
          .insert([bedForm]);
        if (error) throw error;
        toast({ title: "Bed created successfully!" });
      }
      setOpenDialog(null);
      resetForms();
      window.location.reload();
    } catch (error) {
      toast({ title: "Error", description: "Failed to save bed", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (type: 'unit' | 'room' | 'bed', id: string) => {
    if (!confirm(`Are you sure you want to delete this ${type}? This action cannot be undone.`)) return;
    
    setIsLoading(true);
    try {
      const tableName = type === 'unit' ? 'units' : type === 'room' ? 'rooms' : 'beds';
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      toast({ title: `${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully!` });
      window.location.reload();
    } catch (error) {
      toast({ title: "Error", description: `Failed to delete ${type}`, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const openEditDialog = (type: 'unit' | 'room' | 'bed', item: any) => {
    setEditingItem(item);
    
    if (type === 'unit') {
      setUnitForm({
        name: item.name,
        description: item.description || '',
        floor_number: item.floor_number,
        capacity: item.capacity
      });
    } else if (type === 'room') {
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
    }
    
    setOpenDialog(type);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Settings className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Hospital Management Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Manage units, rooms, and beds
              </p>
            </div>
          </div>
          <UserNav />
        </div>

        <Tabs defaultValue="units" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="units" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Units
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

          {/* Units Tab */}
          <TabsContent value="units">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Hospital Units</CardTitle>
                  <Dialog open={openDialog === 'unit'} onOpenChange={(open) => !open && setOpenDialog(null)}>
                    <DialogTrigger asChild>
                      <Button onClick={() => { resetForms(); setOpenDialog('unit'); }}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Unit
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{editingItem ? 'Edit Unit' : 'Add New Unit'}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="unit-name">Unit Name</Label>
                          <Input
                            id="unit-name"
                            value={unitForm.name}
                            onChange={(e) => setUnitForm({...unitForm, name: e.target.value})}
                            placeholder="e.g., ICU, Emergency"
                          />
                        </div>
                        <div>
                          <Label htmlFor="unit-description">Description</Label>
                          <Input
                            id="unit-description"
                            value={unitForm.description}
                            onChange={(e) => setUnitForm({...unitForm, description: e.target.value})}
                            placeholder="Brief description"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="floor-number">Floor Number</Label>
                            <Input
                              id="floor-number"
                              type="number"
                              value={unitForm.floor_number}
                              onChange={(e) => setUnitForm({...unitForm, floor_number: parseInt(e.target.value)})}
                            />
                          </div>
                          <div>
                            <Label htmlFor="unit-capacity">Capacity</Label>
                            <Input
                              id="unit-capacity"
                              type="number"
                              value={unitForm.capacity}
                              onChange={(e) => setUnitForm({...unitForm, capacity: parseInt(e.target.value)})}
                            />
                          </div>
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={() => setOpenDialog(null)}>Cancel</Button>
                          <Button onClick={handleSaveUnit} disabled={isLoading}>
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
                      <TableHead>Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Floor</TableHead>
                      <TableHead>Capacity</TableHead>
                      <TableHead>Rooms</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {units.map((unit) => (
                      <TableRow key={unit.id}>
                        <TableCell className="font-medium">{unit.name}</TableCell>
                        <TableCell>{unit.description}</TableCell>
                        <TableCell>{unit.floor_number}</TableCell>
                        <TableCell>{unit.capacity}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {roomsByUnit[unit.id]?.length || 0} rooms
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => openEditDialog('unit', unit)}>
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleDelete('unit', unit.id)}>
                              <Trash2 className="h-3 w-3" />
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
                  <CardTitle>Hospital Rooms</CardTitle>
                  <Dialog open={openDialog === 'room'} onOpenChange={(open) => !open && setOpenDialog(null)}>
                    <DialogTrigger asChild>
                      <Button onClick={() => { resetForms(); setOpenDialog('room'); }}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Room
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{editingItem ? 'Edit Room' : 'Add New Room'}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="room-unit">Unit</Label>
                          <Select value={roomForm.unit_id} onValueChange={(value) => setRoomForm({...roomForm, unit_id: value})}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select unit" />
                            </SelectTrigger>
                            <SelectContent>
                              {units.map((unit) => (
                                <SelectItem key={unit.id} value={unit.id}>{unit.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="room-name">Room Name</Label>
                            <Input
                              id="room-name"
                              value={roomForm.name}
                              onChange={(e) => setRoomForm({...roomForm, name: e.target.value})}
                              placeholder="e.g., ICU Room 1"
                            />
                          </div>
                          <div>
                            <Label htmlFor="room-number">Room Number</Label>
                            <Input
                              id="room-number"
                              value={roomForm.room_number}
                              onChange={(e) => setRoomForm({...roomForm, room_number: e.target.value})}
                              placeholder="e.g., 301"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="room-type">Room Type</Label>
                            <Select value={roomForm.room_type} onValueChange={(value) => setRoomForm({...roomForm, room_type: value})}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="standard">Standard</SelectItem>
                                <SelectItem value="private">Private</SelectItem>
                                <SelectItem value="icu">ICU</SelectItem>
                                <SelectItem value="emergency">Emergency</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="room-capacity">Capacity</Label>
                            <Input
                              id="room-capacity"
                              type="number"
                              value={roomForm.capacity}
                              onChange={(e) => setRoomForm({...roomForm, capacity: parseInt(e.target.value)})}
                            />
                          </div>
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={() => setOpenDialog(null)}>Cancel</Button>
                          <Button onClick={handleSaveRoom} disabled={isLoading}>
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
                      <TableHead>Unit</TableHead>
                      <TableHead>Room Name</TableHead>
                      <TableHead>Room Number</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Capacity</TableHead>
                      <TableHead>Beds</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rooms.map((room) => {
                      const unit = units.find(u => u.id === room.unit_id);
                      return (
                        <TableRow key={room.id}>
                          <TableCell>{unit?.name}</TableCell>
                          <TableCell className="font-medium">{room.name}</TableCell>
                          <TableCell>{room.room_number}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{room.room_type}</Badge>
                          </TableCell>
                          <TableCell>{room.capacity}</TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {bedsByRoom[room.id]?.length || 0} beds
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" onClick={() => openEditDialog('room', room)}>
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => handleDelete('room', room.id)}>
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
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
                  <CardTitle>Hospital Beds</CardTitle>
                  <Dialog open={openDialog === 'bed'} onOpenChange={(open) => !open && setOpenDialog(null)}>
                    <DialogTrigger asChild>
                      <Button onClick={() => { resetForms(); setOpenDialog('bed'); }}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Bed
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{editingItem ? 'Edit Bed' : 'Add New Bed'}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="bed-room">Room</Label>
                          <Select value={bedForm.room_id} onValueChange={(value) => setBedForm({...bedForm, room_id: value})}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select room" />
                            </SelectTrigger>
                            <SelectContent>
                              {rooms.map((room) => (
                                <SelectItem key={room.id} value={room.id}>{room.name} ({room.room_number})</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="bed-label">Bed Label</Label>
                            <Input
                              id="bed-label"
                              value={bedForm.label}
                              onChange={(e) => setBedForm({...bedForm, label: e.target.value})}
                              placeholder="e.g., Bed A"
                            />
                          </div>
                          <div>
                            <Label htmlFor="bed-number">Bed Number</Label>
                            <Input
                              id="bed-number"
                              value={bedForm.bed_number}
                              onChange={(e) => setBedForm({...bedForm, bed_number: e.target.value})}
                              placeholder="e.g., 301A"
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="bed-type">Bed Type</Label>
                          <Select value={bedForm.bed_type} onValueChange={(value) => setBedForm({...bedForm, bed_type: value})}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="standard">Standard</SelectItem>
                              <SelectItem value="icu">ICU</SelectItem>
                              <SelectItem value="pediatric">Pediatric</SelectItem>
                              <SelectItem value="bariatric">Bariatric</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={() => setOpenDialog(null)}>Cancel</Button>
                          <Button onClick={handleSaveBed} disabled={isLoading}>
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
                      <TableHead>Room</TableHead>
                      <TableHead>Bed Label</TableHead>
                      <TableHead>Bed Number</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {beds.map((bed) => {
                      const room = rooms.find(r => r.id === bed.room_id);
                      return (
                        <TableRow key={bed.id}>
                          <TableCell>{room?.name} ({room?.room_number})</TableCell>
                          <TableCell className="font-medium">{bed.label}</TableCell>
                          <TableCell>{bed.bed_number}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{bed.bed_type}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={bed.is_occupied ? "destructive" : "default"}>
                              {bed.is_occupied ? "Occupied" : "Available"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" onClick={() => openEditDialog('bed', bed)}>
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => handleDelete('bed', bed.id)}>
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};