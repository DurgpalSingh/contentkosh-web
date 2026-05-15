'use client';

import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { useTeacherStore } from '@/store/useTeacherStore';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { TeachersService, TeacherWithUser } from '@/lib/api';
import { ArrowLeft, User as UserIcon, BookOpen, Mail, Phone, Edit, AlertCircle, Sparkles, Briefcase, GraduationCap, Languages } from 'lucide-react';
import { CreateTeacherProfileModal } from '@/components/modals/CreateTeacherProfileModal';
import { EditTeacherProfileModal } from '@/components/modals/EditTeacherProfileModal';
import { resolveProfileFetchError } from '@/lib/profileFetchError';
import { resolveAssetUrl } from '@/lib/assets/assetUrl';

export default function TeacherProfilePage() {
  const router = useRouter();
  const params = useParams();
  const userId = parseInt(params.userId as string, 10);

  const { isAuthenticated, isInitialized, business } = useAuthStore();
  const { selectedTeacherUser } = useTeacherStore();

  const [teacher, setTeacher] = useState<TeacherWithUser | null>(null);
  const [targetUser, setTargetUser] = useState<TeacherWithUser['user'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateProfileModalOpen, setIsCreateProfileModalOpen] = useState(false);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const targetUserProfilePicture = resolveAssetUrl(
    (targetUser as { profilePicture?: string | null } | null)?.profilePicture ??
      (teacher?.user as { profilePicture?: string | null } | undefined)?.profilePicture ??
      null,
  );

  const fetchTeacherProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setTeacher(null);

      if (!Number.isFinite(userId)) {
        setError('Invalid teacher user id');
        return;
      }

      const profile = await TeachersService.getApiTeachersByUserId(userId);
      if (profile?.data) {
        setTeacher(profile.data as TeacherWithUser);
        if (profile.data.user) {
          setTargetUser(profile.data.user as TeacherWithUser['user']);
        }
      }
    } catch (err: unknown) {
      const message = resolveProfileFetchError({
        err,
        fallbackMessage: 'Failed to fetch teacher profile',
        suppressNotFoundError: !!selectedTeacherUser && selectedTeacherUser.id === userId,
        notFoundMessage: 'Teacher profile not found. Please open from Users page to create profile.',
      });

      if (message) {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  }, [userId, selectedTeacherUser]);

  useEffect(() => {
    if (isAuthenticated && isInitialized && userId) {
      fetchTeacherProfile();
    }
  }, [userId, isAuthenticated, isInitialized, fetchTeacherProfile]);

  useEffect(() => {
    // in case profile doesn't exist yet, we can still show user details from store populated by users page.
    if (selectedTeacherUser && selectedTeacherUser.id === userId) {
      setTargetUser(selectedTeacherUser as TeacherWithUser['user']);
    }
  }, [selectedTeacherUser, userId])

  const handleProfileCreated = useCallback(() => {
    setIsCreateProfileModalOpen(false);
    fetchTeacherProfile();
  }, [fetchTeacherProfile]);

  const handleProfileUpdated = useCallback(() => {
    setIsEditProfileModalOpen(false);
    fetchTeacherProfile();
  }, [fetchTeacherProfile]);

  const goBack = () => {
    useTeacherStore.persist.clearStorage();
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
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 sm:p-6">
        <div className="flex items-start sm:items-center justify-between gap-4 flex-col sm:flex-row">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 text-white flex items-center justify-center shadow">
              <BookOpen className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Teacher Profile</h1>
              <p className="text-gray-600">Manage teacher information and profile details</p>
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

      {!teacher && !error && targetUser && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold mb-3">
                <Sparkles className="h-3.5 w-3.5" />
                Profile setup required
              </div>
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Teacher profile not created yet</h3>
              <p className="text-sm text-blue-700 leading-relaxed">
                The profile for <strong className="inline-block max-w-full truncate align-bottom">{targetUser.name}</strong> has not been created yet. Click the button below to create it now.
              </p>
            </div>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white whitespace-nowrap"
              onClick={() => setIsCreateProfileModalOpen(true)}
              disabled={!business?.id}
            >
              Create Profile
            </Button>
          </div>
        </div>
      )}

      {targetUser && (
        <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-6 overflow-hidden">
          <div className="grid grid-cols-1 sm:grid-cols-[auto,1fr] items-start sm:items-center gap-4 sm:gap-6 min-w-0">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center flex-shrink-0">
              {targetUserProfilePicture ? (
                <Image
                  src={targetUserProfilePicture}
                  alt={`${targetUser.name ?? 'Teacher'} profile`}
                  width={64}
                  height={64}
                  unoptimized
                  className="h-full w-full object-cover rounded-full"
                />
              ) : (
                <UserIcon className="h-8 w-8 text-blue-600" />
              )}
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
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  <BookOpen className="h-4 w-4 mr-2" />
                  {targetUser.role}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {teacher && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <Briefcase className="h-4 w-4 text-blue-600" />
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Designation</p>
              </div>
              <p className="text-sm font-semibold text-gray-900">{teacher.designation || 'Not specified'}</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <GraduationCap className="h-4 w-4 text-blue-600" />
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Qualification</p>
              </div>
              <p className="text-sm font-semibold text-gray-900">{teacher.qualification || 'Not specified'}</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <Languages className="h-4 w-4 text-blue-600" />
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Experience</p>
              </div>
              <p className="text-sm font-semibold text-gray-900">{teacher.experienceYears || 0} years</p>
            </div>
          </div>

          <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-6">
            <div className="flex items-center justify-between mb-6 gap-4">
              <h3 className="text-xl font-bold text-gray-900">Professional Details</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditProfileModalOpen(true)}
                className="text-blue-600 hover:text-blue-800"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Designation</label>
                <p className="text-gray-900 font-medium">{teacher.designation || 'Not specified'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Qualification</label>
                <p className="text-gray-900 font-medium">{teacher.qualification || 'Not specified'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Experience</label>
                <p className="text-gray-900 font-medium">{teacher.experienceYears || 0} years</p>
              </div>

              {teacher.languages && teacher.languages.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Languages</label>
                  <div className="flex flex-wrap gap-2">
                    {teacher.languages.map((lang) => (
                      <span
                        key={lang}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800"
                      >
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {teacher.bio && (
              <div className="mt-6 pt-6 border-t border-gray-100">
                <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">{teacher.bio}</p>
              </div>
            )}
          </div>

          <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Personal Details</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {teacher.gender && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                  <p className="text-gray-900 font-medium capitalize">{teacher.gender}</p>
                </div>
              )}

              {teacher.dob && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                  <p className="text-gray-900 font-medium">{new Date(teacher.dob).toLocaleDateString()}</p>
                </div>
              )}

              {teacher.address && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                  <p className="text-gray-900 font-medium">{teacher.address}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {targetUser && business?.id && business.id > 0 && (
        <>
          <CreateTeacherProfileModal
            isOpen={isCreateProfileModalOpen}
            onClose={() => setIsCreateProfileModalOpen(false)}
            businessId={business.id}
            user={{
              id: targetUser.id,
              name: targetUser.name,
              email: targetUser.email
            }}
            onProfileCreated={handleProfileCreated}
          />

          {teacher && (
            <EditTeacherProfileModal
              isOpen={isEditProfileModalOpen}
              onClose={() => setIsEditProfileModalOpen(false)}
              teacher={teacher}
              onProfileUpdated={handleProfileUpdated}
            />
          )}
        </>
      )}
    </div>
  );
}
