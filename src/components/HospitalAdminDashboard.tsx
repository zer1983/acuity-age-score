import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Building2, Plus, Edit, Trash2, BarChart3 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Unit } from '@/types/assessment';

interface UnitFormData {
  name: string;
  description: string;
  floor_number: number;
  capacity: number;
}

interface UnitMetrics {
  unit_id: string;
  unit_name: string;
  morning_avg: number;
  evening_avg: number;
  total_assessments: number;
}

export const HospitalAdminDashboard: React.FC = () => {
  const [units, setUnits] = useState<Unit[]>([]);
  const [unitMetrics, setUnitMetrics] = useState<UnitMetrics[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<Unit | null>(null);
  
  const [unitForm, setUnitForm] = useState<UnitFormData>({
    name: '',
    description: '',
    floor_number: 1,
    capacity: 1
  });

  const fetchUnits = async () => {
    try {
      const { data, error } = await supabase
        .from('units')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setUnits(data || []);
    } catch (error) {
      toast({ title: "Error", description: "Failed to load units", variant: "destructive" });
    }
  };

  const fetchUnitMetrics = async () => {
    try {
      const { data, error } = await supabase
        .from('assessments')
        .select(`
          unit_id,
          shift,
          total_score,
          units!inner(name)
        `);
      
      if (error) throw error;
      
      // Calculate metrics per unit and shift
      const metricsMap = new Map<string, {
        unit_name: string;
        morning_scores: number[];
        evening_scores: number[];
      }>();

      (data || []).forEach((assessment: any) => {
        if (!assessment.unit_id) return;
        
        const key = assessment.unit_id;
        if (!metricsMap.has(key)) {
          metricsMap.set(key, {
            unit_name: assessment.units.name,
            morning_scores: [],
            evening_scores: []
          });
        }
        
        const metrics = metricsMap.get(key)!;
        if (assessment.shift === 'morning') {
          metrics.morning_scores.push(assessment.total_score || 0);
        } else {
          metrics.evening_scores.push(assessment.total_score || 0);
        }
      });

      const calculatedMetrics: UnitMetrics[] = Array.from(metricsMap.entries()).map(([unit_id, data]) => ({
        unit_id,
        unit_name: data.unit_name,
        morning_avg: data.morning_scores.length > 0 
          ? data.morning_scores.reduce((a, b) => a + b, 0) / data.morning_scores.length 
          : 0,
        evening_avg: data.evening_scores.length > 0 
          ? data.evening_scores.reduce((a, b) => a + b, 0) / data.evening_scores.length 
          : 0,
        total_assessments: data.morning_scores.length + data.evening_scores.length
      }));

      setUnitMetrics(calculatedMetrics);
    } catch (error) {
      toast({ title: "Error", description: "Failed to load unit metrics", variant: "destructive" });
    }
  };

  useEffect(() => {
    fetchUnits();
    fetchUnitMetrics();
  }, []);

  const resetForm = () => {
    setUnitForm({ name: '', description: '', floor_number: 1, capacity: 1 });
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
      setOpenDialog(false);
      resetForm();
      fetchUnits();
    } catch (error) {
      toast({ title: "Error", description: "Failed to save unit", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUnit = async (id: string) => {
    if (!confirm('Are you sure you want to delete this unit? This action cannot be undone.')) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('units')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      toast({ title: "Unit deleted successfully!" });
      fetchUnits();
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete unit", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const openEditDialog = (unit: Unit) => {
    setEditingItem(unit);
    setUnitForm({
      name: unit.name,
      description: unit.description || '',
      floor_number: unit.floor_number || 1,
      capacity: unit.capacity || 1
    });
    setOpenDialog(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Building2 className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Hospital Administration
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage hospital units and view system-wide performance
          </p>
        </div>
      </div>

      {/* Unit Performance Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            <CardTitle>Unit Performance Overview</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Unit Name</TableHead>
                <TableHead>Morning Avg Score</TableHead>
                <TableHead>Evening Avg Score</TableHead>
                <TableHead>Total Assessments</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {unitMetrics.map((metrics) => (
                <TableRow key={metrics.unit_id}>
                  <TableCell className="font-medium">{metrics.unit_name}</TableCell>
                  <TableCell>{metrics.morning_avg.toFixed(1)}</TableCell>
                  <TableCell>{metrics.evening_avg.toFixed(1)}</TableCell>
                  <TableCell>{metrics.total_assessments}</TableCell>
                  <TableCell>
                    <Badge variant={metrics.total_assessments > 10 ? "default" : "secondary"}>
                      {metrics.total_assessments > 10 ? "Active" : "Low Activity"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Unit Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Unit Management</CardTitle>
            <Dialog open={openDialog} onOpenChange={(open) => !open && setOpenDialog(false)}>
              <DialogTrigger asChild>
                <Button onClick={() => { resetForm(); setOpenDialog(true); }}>
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
                      placeholder="e.g., Pediatric Oncology"
                    />
                  </div>
                  <div>
                    <Label htmlFor="unit-description">Description</Label>
                    <Input
                      id="unit-description"
                      value={unitForm.description}
                      onChange={(e) => setUnitForm({...unitForm, description: e.target.value})}
                      placeholder="Unit description"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="floor-number">Floor Number</Label>
                      <Input
                        id="floor-number"
                        type="number"
                        value={unitForm.floor_number}
                        onChange={(e) => setUnitForm({...unitForm, floor_number: parseInt(e.target.value) || 1})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="capacity">Capacity</Label>
                      <Input
                        id="capacity"
                        type="number"
                        value={unitForm.capacity}
                        onChange={(e) => setUnitForm({...unitForm, capacity: parseInt(e.target.value) || 1})}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setOpenDialog(false)}>Cancel</Button>
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
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {units.map((unit) => (
                <TableRow key={unit.id}>
                  <TableCell className="font-medium">{unit.name}</TableCell>
                  <TableCell>{unit.description || 'N/A'}</TableCell>
                  <TableCell>{unit.floor_number || 'N/A'}</TableCell>
                  <TableCell>{unit.capacity || 'N/A'}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => openEditDialog(unit)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDeleteUnit(unit.id)}>
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
    </div>
  );
};