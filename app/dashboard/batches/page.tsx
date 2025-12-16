'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { BatchesService, BatchUsersService, ExamsService, CoursesService } from '@/lib/api';
import { Batch, BatchWithUsers, BatchUser } from '@/lib/api';
import { 
  Calendar, 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  UserPlus, 
  UserMinus,
  Clock,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

export default function BatchesPage() {
  const { user, business, isAuthenticated, isLoading, isInitialized, initializeAuth } = useAuthStore();
  const router = useRouter();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [expandedBatches, setExpandedBatches] = useState<Set<number>>(new Set());
  const [batchUsers, setBatchUsers] = useState<Map<number, BatchUser[]>>(new Map());
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
    const fetchBatches = async () => {
      if (!business?.id) {
        setError('Business information not available');
        setLoading(false);
        return;
      }

      try {
        console.log('Fetching batches for business:', business.id);

        // 1. Fetch exams
        const examsResponse = await ExamsService.getApiExams(business.id);
        const exams = examsResponse.data || [];

        // 2. Fetch courses for each exam
        const allBatches: Batch[] = [];

        for (const exam of exams) {
          if (!exam.id) continue;
          try {
            const examWithCoursesResponse = await ExamsService.getApiExamsWithCourses(exam.id);
            const courses = examWithCoursesResponse.data?.courses || [];

            // 3. Fetch batches for each course
            for (const course of courses) {
              if (!course.id) continue;
              try {
                const batchesResponse = await BatchesService.getApiBatchesCourse(course.id);
                if (batchesResponse.data) {
                  allBatches.push(...batchesResponse.data);
                }
              } catch (err) {
                console.error(`Failed to fetch batches for course ${course.id}`, err);
              }
            }
          } catch (err) {
            console.error(`Failed to fetch courses for exam ${exam.id}`, err);
          }
        }

        setBatches(allBatches);
      } catch (err: any) {
        console.error('Error fetching batches:', err);
        setError(err.body?.message || 'Failed to fetch batches');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && business?.id) {
      fetchBatches();
    }
  }, [isAuthenticated, business?.id]);

  const fetchBatchUsers = async (batchId: number) => {
    try {
      console.log('Fetching users for batch:', batchId);
      const response = await BatchesService.getApiBatchesWithUsers(batchId);
      console.log('Batch users response:', response);
      
      if (response.data?.batchUsers) {
        setBatchUsers(prev => new Map(prev.set(batchId, response.data!.batchUsers!)));
      }
    } catch (err: any) {
      console.error('Error fetching batch users:', err);
    }
  };

  const toggleBatch = async (batchId: number) => {
    const newExpanded = new Set(expandedBatches);
    if (newExpanded.has(batchId)) {
      newExpanded.delete(batchId);
    } else {
      newExpanded.add(batchId);
      // Fetch users when expanding
      if (!batchUsers.has(batchId)) {
        await fetchBatchUsers(batchId);
      }
    }
    setExpandedBatches(newExpanded);
  };

  const addUserToBatch = async (batchId: number, userId: number) => {
    try {
      console.log('Adding user to batch:', { batchId, userId });
      await BatchUsersService.postApiBatchesAddUser({
        batchId,
        userId
      });
      
      // Refresh batch users
      await fetchBatchUsers(batchId);
    } catch (err: any) {
      console.error('Error adding user to batch:', err);
    }
  };

  const removeUserFromBatch = async (batchId: number, userId: number) => {
    try {
      console.log('Removing user from batch:', { batchId, userId });
      await BatchUsersService.postApiBatchesRemoveUser({
        batchId,
        userId
      });
      
      // Refresh batch users
      await fetchBatchUsers(batchId);
    } catch (err: any) {
      console.error('Error removing user from batch:', err);
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
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Batches</h1>
            <p className="text-gray-600">Manage student batches and their members</p>
          </div>
          <div className="flex space-x-3">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center">
              <Plus className="h-4 w-4 mr-2" />
              Add Batch
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
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="text-sm text-red-600 mt-1">{error}</p>
              </div>
            </div>
          </div>
        ) : batches.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No batches found</h3>
            <p className="text-gray-600 mb-4">Create your first batch to get started.</p>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              Add First Batch
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {batches.map((batch) => (
              <BatchCard
                key={batch.id}
                batch={batch}
                isExpanded={expandedBatches.has(batch.id!)}
                onToggle={() => toggleBatch(batch.id!)}
                users={batchUsers.get(batch.id!) || []}
                onAddUser={(userId) => addUserToBatch(batch.id!, userId)}
                onRemoveUser={(userId) => removeUserFromBatch(batch.id!, userId)}
              />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

function BatchCard({ 
  batch, 
  isExpanded, 
  onToggle, 
  users, 
  onAddUser, 
  onRemoveUser 
}: { 
  batch: Batch;
  isExpanded: boolean;
  onToggle: () => void;
  users: BatchUser[];
  onAddUser: (userId: number) => void;
  onRemoveUser: (userId: number) => void;
}) {
  const getStatusColor = (isActive: boolean) => {
    return isActive 
      ? 'bg-green-100 text-green-800' 
      : 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (isActive: boolean) => {
    return isActive 
      ? <CheckCircle className="h-4 w-4" />
      : <XCircle className="h-4 w-4" />;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString();
  };

  const getDateStatus = () => {
    if (!batch.startDate || !batch.endDate) return 'text-gray-500';
    
    const now = new Date();
    const start = new Date(batch.startDate);
    const end = new Date(batch.endDate);
    
    if (now < start) return 'text-blue-600'; // Not started
    if (now > end) return 'text-red-600'; // Ended
    return 'text-green-600'; // Active
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      <div 
        className="px-6 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              {isExpanded ? (
                <ChevronDown className="h-5 w-5 text-gray-400" />
              ) : (
                <ChevronRight className="h-5 w-5 text-gray-400" />
              )}
            </div>
            <div className="flex-shrink-0">
              <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-3">
                <h3 className="text-lg font-medium text-gray-900">{batch.displayName}</h3>
                <span className="text-sm text-gray-500">({batch.codeName})</span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(batch.isActive!)}`}>
                  {getStatusIcon(batch.isActive!)}
                  <span className="ml-1">{batch.isActive ? 'Active' : 'Inactive'}</span>
                </span>
              </div>
              <div className="flex items-center mt-2 space-x-4 text-sm text-gray-500">
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  <span>{users.length} members</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  <span className={getDateStatus()}>
                    {formatDate(batch.startDate)} - {formatDate(batch.endDate)}
                  </span>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>
                    Created {batch.createdAt 
                      ? new Date(batch.createdAt).toLocaleDateString()
                      : 'Unknown date'
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button className="text-gray-400 hover:text-gray-600 p-1">
              <Edit className="h-4 w-4" />
            </button>
            <button className="text-gray-400 hover:text-red-600 p-1">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-gray-200 bg-gray-50">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-medium text-gray-900">Batch Members ({users.length})</h4>
              <button className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-700 transition-colors flex items-center">
                <UserPlus className="h-3 w-3 mr-1" />
                Add Member
              </button>
            </div>
            
            {users.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Users className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p>No members in this batch</p>
                <button 
                  className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                  onClick={() => onAddUser(1)} // Mock user ID
                >
                  Add first member
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {users.map((batchUser) => (
                  <UserMemberCard
                    key={batchUser.id}
                    batchUser={batchUser}
                    onRemove={() => onRemoveUser(batchUser.userId!)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function UserMemberCard({ 
  batchUser, 
  onRemove 
}: { 
  batchUser: BatchUser;
  onRemove: () => void;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
              <Users className="h-4 w-4 text-gray-600" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h5 className="text-sm font-medium text-gray-900">{batchUser.user?.name || 'Unknown User'}</h5>
            <p className="text-xs text-gray-600">{batchUser.user?.email || 'No email'}</p>
            <div className="flex items-center mt-1">
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                batchUser.isActive 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {batchUser.isActive ? 'Active' : 'Inactive'}
              </span>
              <span className="text-xs text-gray-500 ml-2">
                Joined {batchUser.createdAt 
                  ? new Date(batchUser.createdAt).toLocaleDateString()
                  : 'Unknown date'
                }
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <button className="text-gray-400 hover:text-gray-600 p-1">
            <Edit className="h-3 w-3" />
          </button>
          <button 
            className="text-gray-400 hover:text-red-600 p-1"
            onClick={onRemove}
          >
            <UserMinus className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
