'use client';

import { useState, useEffect } from 'react';
import { X, UserCircle2, Briefcase, MapPin, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TeachersService, UpdateTeacherRequest, Gender, TeacherWithUser } from '@/lib/api';

interface EditTeacherProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  teacher: TeacherWithUser;
  onProfileUpdated: () => void;
}

export function EditTeacherProfileModal({
  isOpen,
  onClose,
  teacher,
  onProfileUpdated,
}: EditTeacherProfileModalProps) {
  const [step, setStep] = useState<'professional' | 'personal'>('professional');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [qualification, setQualification] = useState('');
  const [experienceYears, setExperienceYears] = useState(0);
  const [designation, setDesignation] = useState('');
  const [bio, setBio] = useState('');
  const [languages, setLanguages] = useState<string[]>([]);
  const [languageInput, setLanguageInput] = useState('');

  const [gender, setGender] = useState<Gender | ''>('');
  const [dob, setDob] = useState('');
  const [address, setAddress] = useState('');

  useEffect(() => {
    if (isOpen && teacher) {
      setQualification(teacher.qualification || '');
      setExperienceYears(teacher.experienceYears || 0);
      setDesignation(teacher.designation || '');
      setBio(teacher.bio || '');
      setLanguages(teacher.languages || []);
      setLanguageInput('');
      setGender((teacher.gender as Gender) || '');
      setDob(teacher.dob ? new Date(teacher.dob).toISOString().split('T')[0] : '');
      setAddress(teacher.address || '');
      setError(null);
      setStep('professional');
    }
  }, [isOpen, teacher]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleAddLanguage = () => {
    const value = languageInput.trim();
    if (value && !languages.includes(value)) {
      setLanguages([...languages, value]);
      setLanguageInput('');
    }
  };

  const handleRemoveLanguage = (lang: string) => {
    setLanguages(languages.filter((l) => l !== lang));
  };

  const handleSubmit = async () => {
    if (!qualification.trim()) {
      setError('Qualification is required');
      setStep('professional');
      return;
    }

    if (!designation.trim()) {
      setError('Designation is required');
      setStep('professional');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const request: UpdateTeacherRequest = {
        userId: teacher.userId || 0,
        businessId: teacher.businessId || 0,
        professional: {
          qualification: qualification.trim(),
          experienceYears: parseInt(experienceYears.toString(), 10),
          designation: designation.trim(),
          ...(bio.trim() && { bio: bio.trim() }),
          ...(languages.length > 0 && { languages }),
        },
        ...(gender || dob || address.trim()) && {
          personal: {
            ...(gender && { gender }),
            ...(dob && { dob }),
            ...(address.trim() && { address: address.trim() }),
          },
        },
      };

      await TeachersService.putApiTeachers(teacher.id, request);
      onProfileUpdated();
      onClose();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.body?.message || 'Failed to update teacher profile');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setError(null);
    setStep('professional');
    onClose();
  };

  if (!isOpen) return null;

  const inputClassName =
    'w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:opacity-70';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />

      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-auto">
        <div className="sticky top-0 flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700">
          <div>
            <h2 className="text-xl font-semibold text-white">Edit Teacher Profile</h2>
            <p className="text-xs text-blue-100 mt-0.5">Update teacher details</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="text-white/80 hover:text-white hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="rounded-lg border border-blue-100 bg-blue-50/70 p-3 flex items-start gap-3">
            <UserCircle2 className="h-5 w-5 text-blue-700 mt-0.5" />
            <div className="min-w-0">
              <p className="text-sm font-medium text-blue-900">{teacher.user?.name || 'Teacher user'}</p>
              <p className="text-xs text-blue-700 truncate">{teacher.user?.email || '-'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-2 text-xs font-semibold ${step === 'professional' ? 'text-blue-700' : 'text-blue-600'}`}>
              <span className="h-7 w-7 rounded-full bg-blue-600 text-white inline-flex items-center justify-center">1</span>
              <span>Professional</span>
            </div>
            <div className="flex-1 h-1 rounded bg-gray-200" />
            <div className={`flex items-center gap-2 text-xs font-semibold ${step === 'personal' ? 'text-blue-700' : 'text-gray-500'}`}>
              <span className={`h-7 w-7 rounded-full inline-flex items-center justify-center ${step === 'personal' ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'}`}>2</span>
              <span>Personal</span>
            </div>
          </div>

          {step === 'professional' ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-gray-900">
                <Briefcase className="h-4 w-4 text-blue-600" />
                <h3 className="text-lg font-semibold">Professional Details</h3>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Qualification <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={qualification}
                  onChange={(e) => setQualification(e.target.value)}
                  placeholder="e.g., B.Tech, M.Sc"
                  className={inputClassName}
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Experience (Years) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(parseInt(e.target.value, 10) || 0)}
                  className={inputClassName}
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Designation <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  placeholder="e.g., Senior Teacher, Lecturer"
                  className={inputClassName}
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bio <span className="text-gray-400 text-xs">(Optional)</span>
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Brief bio or introduction..."
                  rows={3}
                  className={inputClassName}
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Languages <span className="text-gray-400 text-xs">(Optional)</span>
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={languageInput}
                    onChange={(e) => setLanguageInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddLanguage();
                      }
                    }}
                    placeholder="e.g., English, Hindi"
                    className={inputClassName}
                    disabled={loading}
                  />
                  <Button
                    type="button"
                    onClick={handleAddLanguage}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    disabled={loading || !languageInput.trim()}
                  >
                    Add
                  </Button>
                </div>
                {languages.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {languages.map((lang) => (
                      <span
                        key={lang}
                        className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                      >
                        {lang}
                        <button
                          type="button"
                          onClick={() => handleRemoveLanguage(lang)}
                          className="text-blue-800 hover:text-blue-900"
                          disabled={loading}
                        >
                          x
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-gray-900">
                <MapPin className="h-4 w-4 text-blue-600" />
                <h3 className="text-lg font-semibold">Personal Details (Optional)</h3>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as Gender | '')}
                  className={inputClassName}
                  disabled={loading}
                >
                  <option value="">Select Gender</option>
                  <option value={Gender.MALE}>Male</option>
                  <option value={Gender.FEMALE}>Female</option>
                  <option value={Gender.OTHER}>Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className={inputClassName}
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Full address..."
                  rows={3}
                  className={inputClassName}
                  disabled={loading}
                />
              </div>
            </div>
          )}

          <div className="flex justify-between pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => (step === 'professional' ? handleClose() : setStep('professional'))}
              disabled={loading}
            >
              {step === 'professional' ? 'Cancel' : 'Back'}
            </Button>

            {step === 'professional' ? (
              <Button
                type="button"
                onClick={() => setStep('personal')}
                className="bg-blue-600 hover:bg-blue-700 text-white"
                disabled={loading}
              >
                Next
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSubmit}
                className="bg-blue-600 hover:bg-blue-700 text-white"
                disabled={loading}
              >
                {loading ? 'Updating...' : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Update Profile
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
