'use client';

import { useState, useEffect } from 'react';
import { X, UserCircle2, Briefcase, MapPin, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { TeachersService, CreateTeacherRequest, Gender, User } from '@/lib/api';
import { validateProfessionalStep, ProfessionalStepErrors } from '@/lib/validation';
import { LanguageInputChips } from './LanguageInputChips';

interface CreateTeacherProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  businessId: number;
  user: User;
  onProfileCreated: () => void;
}

export function CreateTeacherProfileModal({
  isOpen,
  onClose,
  businessId,
  user,
  onProfileCreated,
}: CreateTeacherProfileModalProps) {
  const [step, setStep] = useState<'professional' | 'personal'>('professional');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<ProfessionalStepErrors>({});

  const [qualification, setQualification] = useState('');
  const [experienceYears, setExperienceYears] = useState<number | ''>('');
  const [designation, setDesignation] = useState('');
  const [bio, setBio] = useState('');
  const [languages, setLanguages] = useState<string[]>([]);

  const [gender, setGender] = useState<Gender | ''>('');
  const [dob, setDob] = useState('');
  const [address, setAddress] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const resetForm = () => {
    setStep('professional');
    setQualification('');
    setExperienceYears('');
    setDesignation('');
    setBio('');
    setLanguages([]);
    setGender('');
    setDob('');
    setAddress('');
    setError(null);
    setValidationErrors({});
  };

  const validateProfessionalFields = (): boolean => {
    const errors = validateProfessionalStep(qualification, experienceYears, designation);
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNextStep = () => {
    if (validateProfessionalFields()) {
      setValidationErrors({});
      setError(null);
      setStep('personal');
    }
  };

  const handleSubmit = async () => {
    if (!validateProfessionalFields()) {
      setError('Please fix the highlighted professional details');
      setStep('professional');
      return;
    }

    if (!user.id) {
      setError('Teacher user id is missing');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const normalizedExperienceYears = typeof experienceYears === 'number'
        ? experienceYears
        : Number(experienceYears);

      const request: CreateTeacherRequest = {
        userId: user.id,
        businessId,
        professional: {
          qualification: qualification.trim(),
          experienceYears: normalizedExperienceYears,
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

      await TeachersService.postApiTeachersProfile(request);
      resetForm();
      onProfileCreated();
      onClose();

    } catch (err: any) {
      setError(err.body?.message || 'Failed to create teacher profile');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const clearFieldError = (fieldName: keyof ProfessionalStepErrors) => {
    if (validationErrors[fieldName]) {
      setValidationErrors(prev => {
        const updated = { ...prev };
        delete updated[fieldName];
        return updated;
      });
    }
  };

  const handleQualificationChange = (value: string) => {
    setQualification(value);
    clearFieldError('qualification');
  };

  const handleExperienceYearsChange = (value: string) => {
    const val = value === '' ? '' : parseInt(value, 10);
    setExperienceYears(val);
    clearFieldError('experienceYears');
  };

  const handleDesignationChange = (value: string) => {
    setDesignation(value);
    clearFieldError('designation');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />

      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-auto">
        <div className="sticky top-0 flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700">
          <div>
            <h2 className="text-xl font-semibold text-white">Create Teacher Profile</h2>
            <p className="text-xs text-blue-100 mt-0.5">Set up professional and personal details</p>
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
              <p className="text-sm font-medium text-blue-900">{user.name || 'Teacher user'}</p>
              <p className="text-xs text-blue-700 truncate">{user.email || '-'}</p>
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
                <Input
                  type="text"
                  value={qualification}
                  onChange={(e) => handleQualificationChange(e.target.value)}
                  placeholder="e.g., B.Tech, M.Sc"
                  className={`w-full px-4 py-2 border rounded-lg transition-colors disabled:opacity-70 ${
                    validationErrors.qualification 
                      ? 'border-red-400 focus:ring-2 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  }`}
                  disabled={loading}
                />
                {validationErrors.qualification && (
                  <div className="flex items-center gap-1.5 mt-1.5 text-red-600 text-sm">
                    <AlertCircle className="h-3.5 w-3.5" />
                    {validationErrors.qualification}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Experience (Years) <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  min="0"
                  max="50"
                  value={experienceYears}
                  onChange={(e) => handleExperienceYearsChange(e.target.value)}
                  placeholder="0"
                  className={`w-full px-4 py-2 border rounded-lg transition-colors disabled:opacity-70 ${
                    validationErrors.experienceYears 
                      ? 'border-red-400 focus:ring-2 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  }`}
                  disabled={loading}
                />
                {validationErrors.experienceYears && (
                  <div className="flex items-center gap-1.5 mt-1.5 text-red-600 text-sm">
                    <AlertCircle className="h-3.5 w-3.5" />
                    {validationErrors.experienceYears}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Designation <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  value={designation}
                  onChange={(e) => handleDesignationChange(e.target.value)}
                  placeholder="e.g., Senior Teacher, Lecturer"
                  className={`w-full px-4 py-2 border rounded-lg transition-colors disabled:opacity-70 ${
                    validationErrors.designation 
                      ? 'border-red-400 focus:ring-2 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  }`}
                  disabled={loading}
                />
                {validationErrors.designation && (
                  <div className="flex items-center gap-1.5 mt-1.5 text-red-600 text-sm">
                    <AlertCircle className="h-3.5 w-3.5" />
                    {validationErrors.designation}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bio <span className="text-gray-400 text-xs">(Optional)</span>
                </label>
                <Textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Brief bio or introduction..."
                  rows={3}
                  className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:opacity-70'
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Languages <span className="text-gray-400 text-xs">(Optional)</span>
                </label>
                <LanguageInputChips languages={languages} onChange={setLanguages} disabled={loading} />
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
                  className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:opacity-70'
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
                <Input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:opacity-70'
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <Textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Full address..."
                  rows={3}
                  className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:opacity-70'
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
                onClick={handleNextStep}
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
                {loading ? 'Creating...' : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Create Profile
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
