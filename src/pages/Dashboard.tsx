import React from 'react';
import { UserNav } from '@/components/UserNav';
import { useUserRole } from '@/hooks/useUserRole';
import { HospitalAdminDashboard } from '@/components/HospitalAdminDashboard';
import { UnitAdminDashboard } from '@/components/UnitAdminDashboard';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { userProfile, loading, isHospitalAdmin, isUnitAdmin } = useUserRole();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-gray-300 rounded animate-pulse"></div>
              <div>
                <div className="h-8 w-64 bg-gray-300 rounded animate-pulse mb-2"></div>
                <div className="h-4 w-48 bg-gray-300 rounded animate-pulse"></div>
              </div>
            </div>
            <UserNav />
          </div>
          
          <Card>
            <CardContent className="flex items-center justify-center p-12">
              <div className="flex items-center gap-2 text-gray-600">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span>Loading dashboard...</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-gray-300 rounded"></div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
                <p className="text-red-600 dark:text-red-400">Profile not found</p>
              </div>
            </div>
            <UserNav />
          </div>
          
          <Card>
            <CardContent className="flex items-center justify-center p-12">
              <div className="text-center">
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
                  Unable to load your profile. Please contact your administrator.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <UserNav />
        </div>

        {isHospitalAdmin() && <HospitalAdminDashboard />}
        {isUnitAdmin() && <UnitAdminDashboard />}
        
        {!isHospitalAdmin() && !isUnitAdmin() && (
          <Card>
            <CardContent className="flex items-center justify-center p-12">
              <div className="text-center">
                <p className="text-lg text-gray-600 dark:text-gray-400">
                  You don't have dashboard access. Please contact your administrator.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};