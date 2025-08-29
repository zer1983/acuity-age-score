import { supabase } from '@/integrations/supabase/client';
import { User, UserRole } from '@/types/assessment';

export interface CreateUserData {
  email: string;
  full_name: string;
  role: UserRole;
  unit_id?: string;
}

export interface UpdateUserData {
  email?: string;
  full_name?: string;
  role?: UserRole;
  unit_id?: string;
  is_active?: boolean;
}

export const userManagement = {
  // Get all users
  async getAllUsers(): Promise<{ data: User[] | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Failed to fetch users' };
    }
  },

  // Get user by ID
  async getUserById(userId: string): Promise<{ data: User | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Failed to fetch user' };
    }
  },

  // Create new user
  async createUser(userData: CreateUserData): Promise<{ data: User | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert([userData])
        .select()
        .single();
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Failed to create user' };
    }
  },

  // Update user
  async updateUser(userId: string, userData: UpdateUserData): Promise<{ data: User | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('users')
        .update(userData)
        .eq('id', userId)
        .select()
        .single();
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Failed to update user' };
    }
  },

  // Delete user
  async deleteUser(userId: string): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);
      
      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Failed to delete user' };
    }
  },

  // Get users by role
  async getUsersByRole(role: UserRole): Promise<{ data: User[] | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('role', role)
        .order('full_name');
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Failed to fetch users by role' };
    }
  },

  // Get users by unit
  async getUsersByUnit(unitId: string): Promise<{ data: User[] | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('unit_id', unitId)
        .order('full_name');
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Failed to fetch users by unit' };
    }
  },

  // Get system metrics
  async getSystemMetrics(): Promise<{
    data: {
      total_users: number;
      total_units: number;
      total_assessments: number;
      active_users_today: number;
      users_by_role: Record<UserRole, number>;
    } | null;
    error: string | null;
  }> {
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

      // Get active users
      const { count: activeUsersCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      // Get users by role
      const { data: usersByRole } = await supabase
        .from('users')
        .select('role');

      const roleCounts: Record<UserRole, number> = {
        user: 0,
        admin: 0,
        hospital_admin: 0,
        system_admin: 0
      };

      usersByRole?.forEach(user => {
        if (user.role in roleCounts) {
          roleCounts[user.role as UserRole]++;
        }
      });

      return {
        data: {
          total_users: userCount || 0,
          total_units: unitCount || 0,
          total_assessments: assessmentCount || 0,
          active_users_today: activeUsersCount || 0,
          users_by_role: roleCounts
        },
        error: null
      };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Failed to fetch system metrics' };
    }
  },

  // Validate user data
  validateUserData(userData: CreateUserData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!userData.email || !userData.email.includes('@')) {
      errors.push('Valid email is required');
    }

    if (!userData.full_name || userData.full_name.trim().length < 2) {
      errors.push('Full name must be at least 2 characters long');
    }

    if (!userData.role || !['user', 'admin', 'hospital_admin', 'system_admin'].includes(userData.role)) {
      errors.push('Valid role is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
};

// Helper function to get role display name
export const getRoleDisplayName = (role: UserRole): string => {
  switch (role) {
    case 'system_admin': return 'System Administrator';
    case 'hospital_admin': return 'Hospital Administrator';
    case 'admin': return 'Unit Administrator';
    case 'user': return 'User';
    default: return role;
  }
};

// Helper function to get role badge variant
export const getRoleBadgeVariant = (role: UserRole): 'default' | 'secondary' | 'destructive' | 'outline' => {
  switch (role) {
    case 'system_admin': return 'destructive';
    case 'hospital_admin': return 'default';
    case 'admin': return 'secondary';
    case 'user': return 'outline';
    default: return 'outline';
  }
};