import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UserRole, UserProfile } from '@/types/assessment';
import { useAuth } from '@/contexts/AuthContext';

export const useUserRole = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchUserProfile = async () => {
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
  };

  const isHospitalAdmin = () => userProfile?.role === 'hospital_admin';
  const isUnitAdmin = () => userProfile?.role === 'unit_admin';
  const isUser = () => userProfile?.role === 'user';
  
  const canManageUnits = () => isHospitalAdmin();
  const canManageRooms = () => isHospitalAdmin() || isUnitAdmin();
  const canManageBeds = () => isHospitalAdmin() || isUnitAdmin();
  const canManagePatients = () => isHospitalAdmin() || isUnitAdmin();
  
  const getUserUnitId = () => userProfile?.unit_id;

  useEffect(() => {
    fetchUserProfile();
  }, [user]);

  return {
    userProfile,
    loading,
    error,
    isHospitalAdmin,
    isUnitAdmin,
    isUser,
    canManageUnits,
    canManageRooms,
    canManageBeds,
    canManagePatients,
    getUserUnitId,
    refetch: fetchUserProfile
  };
};