'use client';

import { useEffect, useState, useCallback, useRef,  useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuthStore } from '@/store/useAuthStore';
import { useTeacherStore } from '@/store/useTeacherStore';
import { useStudentStore } from '@/store/useStudentStore';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { UsersService, BusinessUser, User } from '@/lib/api';
import { ApiError } from '@/lib/api/core/ApiError';
import { Users, Mail, Calendar, Shield, User as UserIcon, Edit } from 'lucide-react';
import { UsersFilterBar, RoleFilter } from '@/components/dashboard/users/UsersFilterBar';
import { resolveAssetUrl } from '@/lib/assets/assetUrl';

import { DeleteConfirmModal } from '@/components/modals/DeleteConfirmModal';
import { EditUserModal } from '@/components/modals/EditUserModal';
import { AddUserModal } from '@/components/modals/AddUserModal';
import { CreateUserRequest } from '@/lib/api';
import { toast } from 'sonner';
import { USER_ROLES } from '@/lib/constants';

type UserIndex = {
  usersByKey: Map<string, BusinessUser>;
  keysByRole: Map<RoleFilter, string[]>;
  searchableByKey: Map<string, string>;
  exactKeysByTerm: Map<string, Set<string>>;
};

const ROLE_FILTER_OPTIONS: RoleFilter[] = [
  'ALL',
  BusinessUser.role.ADMIN,
  BusinessUser.role.SUPERADMIN,
  BusinessUser.role.TEACHER,
  BusinessUser.role.STUDENT,
];

const normalize = (value: string | number | undefined | null): string =>
  String(value ?? '').trim().toLowerCase();

const getUserKey = (userItem: BusinessUser, index: number): string =>
  `${userItem.user?.id ?? 'nouser'}-${userItem.id ?? index}`;

function buildUserIndex(users: BusinessUser[]): UserIndex {
  const usersByKey = new Map<string, BusinessUser>();
  const keysByRole = new Map<RoleFilter, string[]>([['ALL', []]]);
  const searchableByKey = new Map<string, string>();
  const exactKeysByTerm = new Map<string, Set<string>>();

  users.forEach((userItem, index) => {
    const key = getUserKey(userItem, index);
    const role = userItem.role ?? BusinessUser.role.STUDENT;
    const name = normalize(userItem.user?.name);
    const email = normalize(userItem.user?.email);
    const mobile = normalize(userItem.user?.mobile);

    usersByKey.set(key, userItem);
    searchableByKey.set(key, `${name} ${email} ${mobile} ${normalize(role)}`.trim());
    keysByRole.get('ALL')?.push(key);

    if (!keysByRole.has(role)) {
      keysByRole.set(role, []);
    }
    keysByRole.get(role)?.push(key);

    [name, email, mobile].filter(Boolean).forEach((term) => {
      if (!exactKeysByTerm.has(term)) {
        exactKeysByTerm.set(term, new Set());
      }
      exactKeysByTerm.get(term)?.add(key);
    });
  });

  return { usersByKey, keysByRole, searchableByKey, exactKeysByTerm };
}

function getFilteredKeys(index: UserIndex, query: string, role: RoleFilter): string[] {
  const normalizedQuery = normalize(query);
  const roleScopedKeys = index.keysByRole.get(role) ?? [];

  if (!normalizedQuery) {
    return roleScopedKeys;
  }

  const exactMatchedKeys = index.exactKeysByTerm.get(normalizedQuery);
  if (exactMatchedKeys) {
    return roleScopedKeys.filter((key) => exactMatchedKeys.has(key));
  }

  const terms = normalizedQuery.split(/\s+/).filter(Boolean);
  return roleScopedKeys.filter((key) => {
    const searchableText = index.searchableByKey.get(key) ?? '';
    return terms.every((term) => searchableText.includes(term));
  });
}

export default function UsersPage() {
  const { user, business, isAuthenticated, isLoading, isInitialized } = useAuthStore();
  const { setSelectedTeacherUser } = useTeacherStore();
  const { setSelectedStudentUser } = useStudentStore();
  const router = useRouter();
  const teacherUserPath = (userId: string) => `${window.location.pathname}/teacher/${userId}`;
  const studentUserPath = (userId: string) => `${window.location.pathname}/student/${userId}`;
  const [users, setUsers] = useState<BusinessUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<RoleFilter>('ALL');
  const scrollRef = useRef<HTMLDivElement>(null);

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

      // Fetch all users
      const usersResponse = await UsersService.getApiBusinessUsers(business.id);
      setUsers(usersResponse?.data ? (usersResponse.data as BusinessUser[]) : []);
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

  useEffect(() => {
  if (loading) return;

  restoreFilter();
  restoreScrollPosition();
}, [loading]);

const restoreFilter = () => {
  const savedFilter = sessionStorage.getItem('usersPageFilter');
  if (!savedFilter) return;

  setSelectedRole(savedFilter as RoleFilter);
  sessionStorage.removeItem('usersPageFilter');
};

const restoreScrollPosition = () => {
  const savedScrollY = sessionStorage.getItem('usersPageScrollY');
  if (!savedScrollY || !scrollRef.current) return;

  const scrollValue = Number(savedScrollY);
  if (Number.isNaN(scrollValue)) return;

  requestAnimationFrame(() => {
    scrollRef.current!.scrollTop = scrollValue;
  });

  sessionStorage.removeItem('usersPageScrollY');
};

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
      toast.success('User removed successfully');
    } catch (error) {
      console.error("Failed to delete user", error);
      toast.error('Failed to remove user. Please try again.');
      throw error;
    }
  };

  const handleRowClick = (userItem: BusinessUser) => {
    if (userItem.user?.id && userItem.role === USER_ROLES.TEACHER) {
      sessionStorage.setItem('usersPageScrollY', scrollRef.current?.scrollTop.toString() || '0');
      sessionStorage.setItem('usersPageFilter', selectedRole);
      setSelectedTeacherUser({
        id: userItem.user.id,
        name: userItem.user.name || '',
        email: userItem.user.email || '',
        mobile: userItem.user.mobile,
        role: User.role.TEACHER,
      });
      router.push(teacherUserPath(userItem.user.id));
    } else if (userItem.user?.id && userItem.role === USER_ROLES.STUDENT) {
      sessionStorage.setItem('usersPageScrollY', scrollRef.current?.scrollTop.toString() || '0');
      sessionStorage.setItem('usersPageFilter', selectedRole);
      setSelectedStudentUser({
        id: userItem.user.id,
        name: userItem.user.name || '',
        email: userItem.user.email || '',
        mobile: userItem.user.mobile,
        role: User.role.STUDENT,
      });
      router.push(studentUserPath(userItem.user.id));
    }
  };

  const userIndex = useMemo(() => buildUserIndex(users), [users]);

  const filteredUserRows = useMemo(() => {
    const keys = getFilteredKeys(userIndex, searchQuery, selectedRole);
    return keys
      .map((key) => {
        const userItem = userIndex.usersByKey.get(key);
        return userItem ? { key, user: userItem } : null;
      })
      .filter((item): item is { key: string; user: BusinessUser } => Boolean(item));
  }, [userIndex, searchQuery, selectedRole]);

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
        <div className="bg-white shadow rounded-lg flex flex-col h-[calc(100vh-220px)]">
          <div className="px-6 py-4 border-b border-gray-200 flex-shrink-0 space-y-4">
            <h3 className="text-lg font-medium text-gray-900">
              All Users ({filteredUserRows.length})
            </h3>
            <UsersFilterBar
              searchQuery={searchQuery}
              selectedRole={selectedRole}
              roleOptions={ROLE_FILTER_OPTIONS}
              onSearchQueryChange={setSearchQuery}
              onRoleChange={setSelectedRole}
            />
          </div>
          
          <div ref={scrollRef} className="overflow-y-auto">
            {filteredUserRows.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No users match your search/filter.
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredUserRows.map((row) => (
                  <UserRowComponent
                    key={row.key}
                    user={row.user}
                    onRowClick={() => handleRowClick(row.user)}
                    onEdit={() => handleEditClick(row.user)}
                    onDelete={() => handleDeleteClick(row.user)}
                  />
                ))}
              </div>
            )}
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

  const isClickable = user.role === 'TEACHER' || user.role === 'STUDENT';
  const profilePicturePath = (user.user as { profilePicture?: string | null } | undefined)?.profilePicture;
  const profilePictureUrl = useMemo(() => resolveAssetUrl(profilePicturePath ?? null), [profilePicturePath]);

  return (
    <div
      className={`px-4 sm:px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer ${isClickable ? 'hover:shadow-md' : ''}`}
      onClick={isClickable ? onRowClick : undefined}
    >
      <div className="flex items-center justify-between gap-4 flex-wrap sm:flex-nowrap">
        <div className="flex items-center space-x-4 flex-1 min-w-0">
          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden">
            {profilePictureUrl ? (
              <Image src={profilePictureUrl} alt={`${user.user?.name ?? 'User'} profile`} width={40} height={40} unoptimized className="h-full w-full object-cover" />
            ) : (
              <UserIcon className="h-5 w-5 text-gray-600" />
            )}
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