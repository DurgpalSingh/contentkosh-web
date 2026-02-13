'use client';

import { useEffect, useState, useCallback } from 'react';
// import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { UsersService } from '@/lib/api';
import { BusinessUser } from '@/lib/api';
import { ApiError } from '@/lib/api/core/ApiError';
import { Users, Mail, Calendar, Shield, User } from 'lucide-react';

import { DeleteConfirmModal } from '@/components/modals/DeleteConfirmModal';
import { EditUserModal } from '@/components/modals/EditUserModal';
import { AddUserModal } from '@/components/modals/AddUserModal';
import { CreateUserRequest } from '@/lib/api';

export default function UsersPage() {
  const { user, business, isAuthenticated, isLoading, isInitialized } = useAuthStore();
  const [users, setUsers] = useState<BusinessUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isAddAdminModalOpen, setIsAddAdminModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<BusinessUser | null>(null);

  const fetchUsers = useCallback(async () => {
    if (!business?.id) {
      setError('Business information not available');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await UsersService.getApiBusinessUsers(business.id);

      if (response && Array.isArray(response.data)) {
        const validated = response.data.filter(
          (item): item is BusinessUser =>
            typeof item === 'object' && item !== null && 'id' in item,
        );
        setUsers(validated);
      } else {
        setUsers([]);
        console.error("Unexpected response format", response);
        setError("Received invalid data from server");
      }
    } catch (err: unknown) {
      const message =
        err instanceof ApiError
          ? (err.body?.message ?? 'Failed to fetch users')
          : 'Failed to fetch users';
      setError(message);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [business]);

  useEffect(() => {
    if (isAuthenticated && business?.id) {
      fetchUsers();
    }
  }, [isAuthenticated, business?.id, fetchUsers]);

  const handleUserAction = () => {
    fetchUsers();
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
      await UsersService.deleteApiUsers(selectedUser.user.id);
      handleUserAction();
    } catch (error) {
      console.error("Failed to delete user", error);
      throw error; // Let the modal handle the error display
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
          <h1 className="text-3xl font-bold text-gray-900">Admins</h1>
          <p className="text-gray-600">Manage administrators in your institute</p>
        </div>
        <div className="flex space-x-3">
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => setIsAddAdminModalOpen(true)}
          >
            <User className="h-4 w-4 mr-2" />
            Add Admin
          </Button>
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
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => setIsAddAdminModalOpen(true)}
          >
            Add First Admin
          </Button>
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
              <UserCard
                key={businessUser.id}
                businessUser={businessUser}
                onEdit={() => handleEditClick(businessUser)}
                onDelete={() => handleDeleteClick(businessUser)}
              />
            ))}
          </div>
        </div>
      )}

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
            title="Remove Admin"
            message="Are you sure you want to remove this admin? They will no longer have access to the business dashboard."
            itemName={selectedUser.user?.name}
          />
        </>
      )}
    </div>
  );
}

function UserCard({
  businessUser,
  onEdit,
  onDelete
}: {
  businessUser: BusinessUser;
  onEdit: () => void;
  onDelete: () => void;
}) {
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
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(
                  businessUser.role
                )}`}
              >
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
                  : 'Unknown date'}
              </span>
            </div>
          </div>

          <div className="flex space-x-3">
            <Button
              variant="ghost"
              size="sm"
              className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
              onClick={onEdit}
            >
              Edit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-red-600 hover:text-red-800 hover:bg-red-50"
              onClick={onDelete}
            >
              Remove
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}