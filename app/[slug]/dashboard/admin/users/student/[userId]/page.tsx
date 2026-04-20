'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { useStudentStore } from '@/store/useStudentStore';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { StudentsService, StudentWithUser } from '@/lib/api';
import { ApiError } from '@/lib/api/core/ApiError';
import {
  ArrowLeft,
  User as UserIcon,
  GraduationCap,
  Mail,
  Phone,
  Edit,
  AlertCircle,
  Sparkles,
  MapPin,
  Languages,
  Calendar,
} from 'lucide-react';
import { CreateStudentProfileModal } from '@/components/modals/CreateStudentProfileModal';
import { EditStudentProfileModal } from '@/components/modals/EditStudentProfileModal';

export default function StudentProfilePage() {
  const router = useRouter();
  const params = useParams();
  const userId = parseInt(params.userId as string, 10);

  const { isAuthenticated, isInitialized, business } = useAuthStore();
  const { selectedStudentUser } = useStudentStore();

  const [student, setStudent] = useState<StudentWithUser | null>(null);
  const [targetUser, setTargetUser] = useState<StudentWithUser['user'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateProfileModalOpen, setIsCreateProfileModalOpen] = useState(false);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);

  const fetchStudentProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setStudent(null);

      if (!Number.isFinite(userId)) {
        setError('Invalid student user id');
        return;
      }

      const profile = await StudentsService.getApiStudentsByUserId(userId);
      if (profile?.data) {
        setStudent(profile.data as StudentWithUser);
        if (profile.data.user) {
          setTargetUser(profile.data.user as StudentWithUser['user']);
        }
      }
    } catch (err: unknown) {
      if (err instanceof ApiError && err.status === 404) {
        if (!selectedStudentUser || selectedStudentUser.id !== userId) {
          setError('Student profile not found. Please open from Users page to create profile.');
        }
      } else {
        const message =
          err instanceof ApiError
            ? (err.body?.message ?? 'Failed to fetch student profile')
            : 'Failed to fetch student profile';
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  }, [userId, selectedStudentUser]);

  useEffect(() => {
    if (isAuthenticated && isInitialized && userId) {
      fetchStudentProfile();
    }
  }, [userId, isAuthenticated, isInitialized, fetchStudentProfile]);

  useEffect(() => {
    if (selectedStudentUser && selectedStudentUser.id === userId) {
      setTargetUser(selectedStudentUser as StudentWithUser['user']);
    }
  }, [selectedStudentUser, userId]);

  const handleProfileCreated = useCallback(() => {
    setIsCreateProfileModalOpen(false);
    fetchStudentProfile();
  }, [fetchStudentProfile]);

  const handleProfileUpdated = useCallback(() => {
    setIsEditProfileModalOpen(false);
    fetchStudentProfile();
  }, [fetchStudentProfile]);

  const goBack = () => {
    useStudentStore.persist.clearStorage();
    router.push(`/${params.slug}/dashboard/admin/users`);
  };

  if (!isInitialized || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 sm:p-6">
        <div className="flex items-start sm:items-center justify-between gap-4 flex-col sm:flex-row">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-green-600 to-green-700 text-white flex items-center justify-center shadow">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Student Profile</h1>
              <p className="text-gray-600">Manage student information and profile details</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={goBack}
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back
          </Button>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="text-sm text-red-600 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Profile setup required banner */}
      {!student && !error && targetUser && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-green-100 text-green-800 text-xs font-semibold mb-3">
                <Sparkles className="h-3.5 w-3.5" />
                Profile setup required
              </div>
              <h3 className="text-lg font-semibold text-green-900 mb-2">Student profile not created yet</h3>
              <p className="text-sm text-green-700 leading-relaxed">
                The profile for <strong className="inline-block max-w-full truncate align-bottom">{targetUser.name}</strong> has not been created yet. Click the button below to create it now.
              </p>
            </div>
            <Button
              className="bg-green-600 hover:bg-green-700 text-white whitespace-nowrap"
              onClick={() => setIsCreateProfileModalOpen(true)}
              disabled={!business?.id}
            >
              Create Profile
            </Button>
          </div>
        </div>
      )}

      {/* User info card */}
      {targetUser && (
        <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-6 overflow-hidden">
          <div className="grid grid-cols-1 sm:grid-cols-[auto,1fr] items-start sm:items-center gap-4 sm:gap-6 min-w-0">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center flex-shrink-0">
              <UserIcon className="h-8 w-8 text-green-600" />
            </div>
            <div className="min-w-0">
              <h2 className="text-2xl font-bold text-gray-900 truncate max-w-full">{targetUser.name}</h2>
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 min-w-0">
                <div className="flex items-center text-gray-600 min-w-0">
                  <Mail className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span className="truncate max-w-full">{targetUser.email}</span>
                </div>
                {targetUser.mobile && (
                  <div className="flex items-center text-gray-600 min-w-0">
                    <Phone className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="truncate max-w-full">{targetUser.mobile}</span>
                  </div>
                )}
              </div>
              <div className="flex items-center mt-3">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  <GraduationCap className="h-4 w-4 mr-2" />
                  {targetUser.role}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Student details */}
      {student && (
        <div className="space-y-6">
          {/* Summary stat cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <UserIcon className="h-4 w-4 text-green-600" />
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Gender</p>
              </div>
              <p className="text-sm font-semibold text-gray-900 capitalize">{student.gender || 'Not specified'}</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <MapPin className="h-4 w-4 text-green-600" />
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">City</p>
              </div>
              <p className="text-sm font-semibold text-gray-900">{student.city || 'Not specified'}</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <Languages className="h-4 w-4 text-green-600" />
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Languages</p>
              </div>
              <p className="text-sm font-semibold text-gray-900">
                {student.languages && student.languages.length > 0
                  ? `${student.languages.length} language${student.languages.length > 1 ? 's' : ''}`
                  : 'Not specified'}
              </p>
            </div>
          </div>

          {/* Personal details card */}
          <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-6">
            <div className="flex items-center justify-between mb-6 gap-4">
              <h3 className="text-xl font-bold text-gray-900">Personal Details</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditProfileModalOpen(true)}
                className="text-green-600 hover:text-green-800"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                <p className="text-gray-900 font-medium capitalize">{student.gender || 'Not specified'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    Date of Birth
                  </span>
                </label>
                <p className="text-gray-900 font-medium">
                  {student.dob ? new Date(student.dob).toLocaleDateString() : 'Not specified'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                <p className="text-gray-900 font-medium">{student.city || 'Not specified'}</p>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                <p className="text-gray-900 font-medium">{student.address || 'Not specified'}</p>
              </div>
            </div>

            {student.languages && student.languages.length > 0 && (
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Languages</label>
                <div className="flex flex-wrap gap-2">
                  {student.languages.map((lang) => (
                    <span
                      key={lang}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800"
                    >
                      {lang}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {student.bio && (
              <div className="mt-6 pt-6 border-t border-gray-100">
                <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">{student.bio}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modals */}
      {targetUser && business?.id && business.id > 0 && (
        <>
          <CreateStudentProfileModal
            isOpen={isCreateProfileModalOpen}
            onClose={() => setIsCreateProfileModalOpen(false)}
            businessId={business.id}
            user={{
              id: targetUser.id,
              name: targetUser.name,
              email: targetUser.email,
            }}
            onProfileCreated={handleProfileCreated}
          />

          {student && (
            <EditStudentProfileModal
              isOpen={isEditProfileModalOpen}
              onClose={() => setIsEditProfileModalOpen(false)}
              student={student}
              onProfileUpdated={handleProfileUpdated}
            />
          )}
        </>
      )}
    </div>
  );
}
