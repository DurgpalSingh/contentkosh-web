'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { BusinessUsersService } from '@/lib/api';
import { BusinessUser } from '@/lib/api';
import { Users, Mail, Calendar, Shield, User } from 'lucide-react';

export default function UsersPage() {
  const { user, business, isAuthenticated, isLoading, isInitialized, initializeAuth } = useAuthStore();
  const router = useRouter();
  const [users, setUsers] = useState<BusinessUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isInitialized) {
      console.log('Initializing auth...');
      initializeAuth();
    }
  }, [initializeAuth, isInitialized]);

  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      console.log('Redirecting to login - not authenticated');
      router.push('/login');
    }
  }, [isAuthenticated, isInitialized, router]);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!business?.id) {
        setError('Business information not available');
        setLoading(false);
        return;
      }

      try {
        console.log('Fetching users for business:', business.id);
        const response = await BusinessUsersService.getApiUsersBusinessUsers(business.id);
        console.log('Users response:', response);
        // Filter only admins
        const admins = (response.data || []).filter(u => u.role === 'ADMIN' || u.role === 'SUPERADMIN');
        setUsers(admins);
      } catch (err: any) {
        console.error('Error fetching users:', err);
        setError(err.body?.message || 'Failed to fetch users');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && business?.id) {
      fetchUsers();
    }
  }, [isAuthenticated, business?.id]);

  if (!isInitialized || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admins</h1>
            <p className="text-gray-600">Manage administrators in your institute</p>
          </div>
          <div className="flex space-x-3">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center">
              <User className="h-4 w-4 mr-2" />
              Add Admin
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center">
              <div className="text-red-600 mr-3">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="text-sm text-red-600 mt-1">{error}</p>
              </div>
            </div>
          </div>
        ) : users.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No admins found</h3>
            <p className="text-gray-600 mb-4">There are no admin users in your institute yet.</p>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              Add First Admin
            </button>
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                All Admins ({users.length})
              </h3>
            </div>
            <div className="divide-y divide-gray-200">
              {users.map((businessUser) => (
                <UserCard key={businessUser.id} businessUser={businessUser} />
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

function UserCard({ businessUser }: { businessUser: BusinessUser }) {
  const getRoleColor = (role?: string) => {
    switch (role) {
      case 'ADMIN':
      case 'SUPERADMIN':
        return 'bg-red-100 text-red-800';
      case 'TEACHER':
        return 'bg-blue-100 text-blue-800';
      case 'STUDENT':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleIcon = (role?: string) => {
    switch (role) {
      case 'ADMIN':
      case 'SUPERADMIN':
        return <Shield className="h-4 w-4" />;
      case 'TEACHER':
        return <User className="h-4 w-4" />;
      case 'STUDENT':
        return <User className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  return (
    <div className="px-6 py-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex-shrink-0">
            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
              <User className="h-5 w-5 text-gray-600" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-3">
              <h4 className="text-sm font-medium text-gray-900 truncate">
                {businessUser.user?.name || 'Unknown User'}
              </h4>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(businessUser.role)}`}>
                {getRoleIcon(businessUser.role)}
                <span className="ml-1">{businessUser.role || 'Unknown'}</span>
              </span>
            </div>
            <div className="flex items-center mt-1 text-sm text-gray-500">
              <Mail className="h-4 w-4 mr-2" />
              <span className="truncate">{businessUser.user?.email || 'No email'}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-500">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              <span>
                {businessUser.createdAt
                  ? new Date(businessUser.createdAt).toLocaleDateString()
                  : 'Unknown date'
                }
              </span>
            </div>
          </div>
          <div className="flex space-x-2">
            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              Edit
            </button>
            <button className="text-red-600 hover:text-red-800 text-sm font-medium">
              Remove
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
