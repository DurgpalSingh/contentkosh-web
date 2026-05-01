'use client';

import { useState, useEffect } from 'react';
import { X, UserCircle2, MapPin, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { StudentsService, CreateStudentRequest, User } from '@/lib/api';
import { LanguageInputChips } from './LanguageInputChips';
import { toast } from 'sonner';

function validateDob(dateStr: string): string | null {
  const selected = new Date(dateStr);
  if (isNaN(selected.getTime())) return 'Invalid date';
  const today = new Date();
  const sel = new Date(selected.getFullYear(), selected.getMonth(), selected.getDate());
  const tod = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  if (sel > tod) return 'Date of birth cannot be in the future';
  let age = tod.getFullYear() - sel.getFullYear();
  const monthDiff = tod.getMonth() - sel.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && tod.getDate() < sel.getDate())) {
    age--;
  }
  if (age < 10) return 'Student must be at least 10 years old';
  return null;
}

interface CreateStudentProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  businessId: number;
  user: User;
  onProfileCreated: () => void;
}

export function CreateStudentProfileModal({
  isOpen,
  onClose,
  businessId,
  user,
  onProfileCreated,
}: CreateStudentProfileModalProps) {
  const [gender, setGender] = useState<string | ''>('');
  const [dob, setDob] = useState('');
  const [languages, setLanguages] = useState<string[]>([]);
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dobError, setDobError] = useState<string | null>(null);

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
    setGender('');
    setDob('');
    setLanguages([]);
    setAddress('');
    setCity('');
    setBio('');
    setError(null);
  };

  const handleSubmit = async () => {
    if (dob && dobError) {
      setError(dobError);
      return;
    }
    if (!user.id) {
      setError('User id is missing');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const request: CreateStudentRequest = {
        userId: user.id,
        businessId,
        ...(dob && { dob }),
        ...(gender && { gender }),
        ...(languages.length > 0 && { languages }),
        ...(address.trim() && { address: address.trim() }),
        ...(city.trim() && { city: city.trim() }),
        ...(bio.trim() && { bio: bio.trim() }),
      };

      await StudentsService.postApiStudentsProfile(request);
      resetForm();
      onProfileCreated();
      onClose();
      toast.success('Student profile created successfully');
    } catch (err: any) {
      setError(err.body?.message || 'Failed to create student profile');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />

      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-auto">
        <div className="sticky top-0 flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700">
          <div>
            <h2 className="text-xl font-semibold text-white">Create Student Profile</h2>
            <p className="text-xs text-blue-100 mt-0.5">Set up student details</p>
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
              <p className="text-sm font-medium text-blue-900 truncate max-w-full">{user.name || 'Student user'}</p>
              <p className="text-xs text-blue-700 truncate max-w-full">{user.email || '-'}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-gray-900">
              <MapPin className="h-4 w-4 text-blue-600" />
              <h3 className="text-lg font-semibold">Profile Details <span className="text-sm font-normal text-gray-500">(All optional)</span></h3>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
              <Input
                type="date"
                value={dob}
                onChange={(e) => {
                  const val = e.target.value;
                  setDob(val);
                  if (val) {
                    const err = validateDob(val);
                    setDobError(err);
                  } else {
                    setDobError(null);
                  }
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:opacity-70"
                disabled={loading}
              />
              {dobError && <p className="text-xs text-red-600 mt-1">{dobError}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
              <Select
                id="create-student-gender"
                value={gender}
                onChange={(v) => setGender(String(v))}
                options={[
                  { value: 'male', label: 'Male' },
                  { value: 'female', label: 'Female' },
                  { value: 'other', label: 'Other' },
                ]}
                placeholder="Select Gender"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Languages</label>
              <LanguageInputChips languages={languages} onChange={setLanguages} disabled={loading} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <Textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Full address..."
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:opacity-70"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <Input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g., Mumbai"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:opacity-70"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
              <Textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Brief bio or introduction..."
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:opacity-70"
                disabled={loading}
              />
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>

            <Button
              type="button"
              onClick={handleSubmit}
              className="bg-blue-600 hover:bg-blue-700 text-white"
              disabled={loading || !!dobError}
            >
              {loading ? 'Creating...' : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Create Profile
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
