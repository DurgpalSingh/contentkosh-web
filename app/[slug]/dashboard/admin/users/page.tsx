'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { useTeacherStore } from '@/store/useTeacherStore';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { UsersService, BusinessUser } from '@/lib/api';
import { ApiError } from '@/lib/api/core/ApiError';
import { Users, Mail, Calendar, Shield, User as UserIcon, Edit, ChevronRight } from 'lucide-react';

import { DeleteConfirmModal } from '@/components/modals/DeleteConfirmModal';
import { EditUserModal } from '@/components/modals/EditUserModal';
import { AddUserModal } from '@/components/modals/AddUserModal';
import { CreateUserRequest } from '@/lib/api';

export default function UsersPage() {
  const { user, business, isAuthenticated, isLoading, isInitialized } = useAuthStore();
  const { setSelectedTeacherUser } = useTeacherStore();
  const router = useRouter();
  const [users, setUsers] = useState<BusinessUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isAddAdminModalOpen, setIsAddAdminModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [selectedUser, setSelectedUser] = useState<BusinessUser | null>(null);

  const fetchData = useCallback(async () => {
    if (!business?.id) {
      setError('Business information not available');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch all users
      const usersResponse = await UsersService.getApiBusinessUsers(business.id);
      const allUsers = Array.isArray(usersResponse?.data) ? (usersResponse.data as BusinessUser[]) : [];
      setUsers(allUsers);
    } catch (err: unknown) {
      const message =
        err instanceof ApiError
          ? (err.body?.message ?? 'Failed to fetch data')
          : 'Failed to fetch data';
      setError(message);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [business]);

  useEffect(() => {
    if (isAuthenticated && business?.id) {
      fetchData();
    }
  }, [isAuthenticated, business?.id, fetchData]);

  const handleUserAction = () => {
    fetchData();
    setSelectedUser(null);
  };

  const handleEditClick = (userToEdit: BusinessUser) => {
    setSelectedUser(userToEdit);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (userToDelete: BusinessUser) => {
    setSelectedUser(userToDelete);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedUser?.user?.id) return;

    try {
      await UsersService.deleteApiUsers(selectedUser.user!.id);
      handleUserAction();
    } catch (error) {
      console.error("Failed to delete user", error);
      throw error;
    }
  };

  const handleRowClick = (userItem: BusinessUser) => {
    if (userItem.user?.id && userItem.role === 'TEACHER') {
      setSelectedTeacherUser({
        id: userItem.user.id,
        name: userItem.user.name || '',
        email: userItem.user.email || '',
        mobile: userItem.user.mobile,
        role: userItem?.role ,
      });
      router.push(`${window.location.pathname}/teacher/${userItem.user.id}`);
    }
  };

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-600">Manage all users in your institute</p>
        </div>
        <div className="flex space-x-3">
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => setIsAddAdminModalOpen(true)}
          >
            <UserIcon className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center">
            <Shield className="h-5 w-5 text-red-600 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="text-sm text-red-600 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : users && users.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
          <p className="text-gray-600 mb-4">There are no users in your institute yet.</p>
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => setIsAddAdminModalOpen(true)}
          >
            Add First user
          </Button>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              All Users ({users.length})
            </h3>
          </div>
          <div className="divide-y divide-gray-200">
            {users && users.map((businessUser) => (
              <UserRowComponent
                key={businessUser.id}
                user={businessUser}
                onRowClick={() => handleRowClick(businessUser)}
                onEdit={() => handleEditClick(businessUser)}
                onDelete={() => handleDeleteClick(businessUser)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      {business?.id && (
        <AddUserModal
          isOpen={isAddAdminModalOpen}
          onClose={() => setIsAddAdminModalOpen(false)}
          businessId={business.id}
          onUserCreated={handleUserAction}
          defaultRole={CreateUserRequest.role.ADMIN}
        />
      )}

      {selectedUser && (
        <>
          <EditUserModal
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setSelectedUser(null);
            }}
            user={selectedUser}
            onUserUpdated={handleUserAction}
          />

          <DeleteConfirmModal
            isOpen={isDeleteModalOpen}
            onClose={() => {
              setIsDeleteModalOpen(false);
              setSelectedUser(null);
            }}
            onConfirm={handleConfirmDelete}
            title="Remove User"
            message="Are you sure you want to remove this user? They will no longer have access to the business dashboard."
            itemName={selectedUser.user?.name}
          />
        </>
      )}
    </div>
  );
}

function UserRowComponent({ user, onRowClick, onEdit, onDelete }: { user: BusinessUser; onRowClick: () => void; onEdit: () => void; onDelete: () => void }) {
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
        return <UserIcon className="h-4 w-4" />;
      case 'STUDENT':
        return <UserIcon className="h-4 w-4" />;
      default:
        return <UserIcon className="h-4 w-4" />;
    }
  };

  const isTeacher = user.role === 'TEACHER';

  return (
    <div 
      className={`px-4 sm:px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer ${isTeacher ? 'hover:shadow-md' : ''}`}
      onClick={isTeacher ? onRowClick : undefined}
    >
      <div className="flex items-center justify-between gap-4 flex-wrap sm:flex-nowrap">
        <div className="flex items-center space-x-4 flex-1 min-w-0">
          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
            <UserIcon className="h-5 w-5 text-gray-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 sm:space-x-3 flex-wrap">
              <h4 className="text-sm font-medium text-gray-900 truncate">{user.user?.name || 'Unknown'}</h4>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                {getRoleIcon(user.role)}
                <span className="ml-1">{user.role || 'Unknown'}</span>
              </span>
            </div>
            <div className="flex items-center mt-1 text-xs sm:text-sm text-gray-500">
              <Mail className="h-4 w-4 mr-2 flex-shrink-0" />
              <span className="truncate">{user.user?.email || 'No email'}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-4 ml-auto flex-shrink-0">
          <div className="hidden sm:block text-sm text-gray-500">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              <span>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}</span>
            </div>
          </div>

          <div className="flex space-x-2 sm:space-x-3">
            <Button
              variant="ghost"
              size="sm"
              className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 text-xs sm:text-sm"
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
            >
              <Edit className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Edit</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-red-600 hover:text-red-800 hover:bg-red-50 text-xs sm:text-sm"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              Remove
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}