import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, Users, Building2, Settings, Plus, Edit, Trash2, BarChart3 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { User, UserRole } from '@/types/assessment';

interface UserFormData {
  email: string;
  full_name: string;
  role: UserRole;
  unit_id?: string;
}

interface SystemMetrics {
  total_users: number;
  total_units: number;
  total_assessments: number;
  active_users_today: number;
}

export const SystemAdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics>({
    total_users: 0,
    total_units: 0,
    total_assessments: 0,
    active_users_today: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  
  const [userForm, setUserForm] = useState<UserFormData>({
    email: '',
    full_name: '',
    role: 'user'
  });

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      toast({ title: "Error", description: "Failed to load users", variant: "destructive" });
    }
  };

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

  const fetchSystemMetrics = async () => {
    try {
      // Get total users
      const { count: userCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      // Get total units
      const { count: unitCount } = await supabase
        .from('units')
        .select('*', { count: 'exact', head: true });

      // Get total assessments
      const { count: assessmentCount } = await supabase
        .from('assessments')
        .select('*', { count: 'exact', head: true });

      // Get active users today (simplified - could be enhanced with actual login tracking)
      const { count: activeUsersCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      setSystemMetrics({
        total_users: userCount || 0,
        total_units: unitCount || 0,
        total_assessments: assessmentCount || 0,
        active_users_today: activeUsersCount || 0
      });
    } catch (error) {
      console.error('Error fetching system metrics:', error);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchUnits();
    fetchSystemMetrics();
  }, []);

  const resetForm = () => {
    setUserForm({ email: '', full_name: '', role: 'user' });
    setEditingUser(null);
  };

  const handleSaveUser = async () => {
    setIsLoading(true);
    try {
      if (editingUser) {
        const { error } = await supabase
          .from('users')
          .update(userForm)
          .eq('id', editingUser.id);
        if (error) throw error;
        toast({ title: "User updated successfully!" });
      } else {
        const { error } = await supabase
          .from('users')
          .insert([userForm]);
        if (error) throw error;
        toast({ title: "User created successfully!" });
      }
      setOpenDialog(false);
      resetForm();
      fetchUsers();
    } catch {
      toast({ title: "Error", description: "Failed to save user", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);
      
      if (error) throw error;
      toast({ title: "User deleted successfully!" });
      fetchUsers();
    } catch {
      toast({ title: "Error", description: "Failed to delete user", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const openEditDialog = (user: User) => {
    setEditingUser(user);
    setUserForm({
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      unit_id: user.unit_id
    });
    setOpenDialog(true);
  };

  const getRoleBadgeVariant = (role: UserRole) => {
    switch (role) {
      case 'system_admin': return 'destructive';
      case 'hospital_admin': return 'default';
      case 'admin': return 'secondary';
      case 'user': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Shield className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            System Administration
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage system-wide settings and user access
          </p>
        </div>
      </div>

      {/* System Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Users</p>
                <p className="text-2xl font-bold">{systemMetrics.total_users}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Building2 className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Units</p>
                <p className="text-2xl font-bold">{systemMetrics.total_units}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Assessments</p>
                <p className="text-2xl font-bold">{systemMetrics.total_assessments}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Active Users Today</p>
                <p className="text-2xl font-bold">{systemMetrics.active_users_today}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>User Management</CardTitle>
            <Dialog open={openDialog} onOpenChange={(open) => !open && setOpenDialog(false)}>
              <DialogTrigger asChild>
                <Button onClick={() => { resetForm(); setOpenDialog(true); }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add User
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingUser ? 'Edit User' : 'Add New User'}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="user-email">Email</Label>
                    <Input
                      id="user-email"
                      type="email"
                      value={userForm.email}
                      onChange={(e) => setUserForm({...userForm, email: e.target.value})}
                      placeholder="user@hospital.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="user-name">Full Name</Label>
                    <Input
                      id="user-name"
                      value={userForm.full_name}
                      onChange={(e) => setUserForm({...userForm, full_name: e.target.value})}
                      placeholder="Full Name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="user-role">Role</Label>
                    <Select value={userForm.role} onValueChange={(value: UserRole) => setUserForm({...userForm, role: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="admin">Unit Admin</SelectItem>
                        <SelectItem value="hospital_admin">Hospital Admin</SelectItem>
                        <SelectItem value="system_admin">System Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="user-unit">Unit (Optional)</Label>
                    <Select value={userForm.unit_id || ''} onValueChange={(value) => setUserForm({...userForm, unit_id: value || undefined})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">No Unit</SelectItem>
                        {units.map((unit) => (
                          <SelectItem key={unit.id} value={unit.id}>{unit.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setOpenDialog(false)}>Cancel</Button>
                    <Button onClick={handleSaveUser} disabled={isLoading}>
                      {isLoading ? 'Saving...' : (editingUser ? 'Update' : 'Create')}
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
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.full_name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={getRoleBadgeVariant(user.role)}>
                      {user.role.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.unit_id ? units.find(u => u.id === user.unit_id)?.name || 'Unknown' : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.is_active ? "default" : "secondary"}>
                      {user.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => openEditDialog(user)}>
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleDeleteUser(user.id)}
                        disabled={user.role === 'system_admin'}
                      >
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
    </div>
  );
};