import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UserRole, UserProfile } from '@/types/assessment';
import { useAuth } from '@/contexts/AuthContext';

export const useUserRole = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchUserProfile = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      setUserProfile(data ? {
        ...data,
        role: data.role as UserRole
      } : null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch user profile');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const isSystemAdmin = () => userProfile?.role === 'system_admin';
  const isHospitalAdmin = () => userProfile?.role === 'hospital_admin';
  const isUnitAdmin = () => userProfile?.role === 'admin';
  const isUser = () => userProfile?.role === 'user';
  
  const canManageUnits = () => isSystemAdmin() || isHospitalAdmin();
  const canManageRooms = () => isSystemAdmin() || isHospitalAdmin() || isUnitAdmin();
  const canManageBeds = () => isSystemAdmin() || isHospitalAdmin() || isUnitAdmin();
  const canManagePatients = () => isSystemAdmin() || isHospitalAdmin() || isUnitAdmin();
  const canManageUsers = () => isSystemAdmin() || isHospitalAdmin();
  
  const getUserUnitId = () => userProfile?.unit_id;

  useEffect(() => {
    fetchUserProfile();
  }, [user, fetchUserProfile]);

  return {
    userProfile,
    loading,
    error,
    isSystemAdmin,
    isHospitalAdmin,
    isUnitAdmin,
    isUser,
    canManageUnits,
    canManageRooms,
    canManageBeds,
    canManagePatients,
    canManageUsers,
    getUserUnitId,
    refetch: fetchUserProfile
  };
};