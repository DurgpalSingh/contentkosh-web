'use client';

import { useState } from 'react';
import { X, UserPlus } from 'lucide-react';
import { BusinessUsersService, AssignUserToBusinessRequest, UsersService, RegisterRequest } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/store/useAuthStore';

interface AddNewStudentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onStudentAdded: () => void;
}

export function AddNewStudentModal({ isOpen, onClose, onStudentAdded }: AddNewStudentModalProps) {
    const { business } = useAuthStore();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const resetForm = () => {
        setName('');
        setEmail('');
        setPassword('');
        setError(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim() || !email.trim() || !password.trim()) {
            setError('All fields are required');
            return;
        }

        if (!business?.id) {
            setError('Business not found');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // First, register the user
            const registerRequest: RegisterRequest = {
                name: name.trim(),
                email: email.trim(),
                password: password.trim(),
            };

            const registerResponse = await UsersService.postApiUsersRegister(registerRequest);
            const newUser = registerResponse.data?.user;

            if (!newUser?.id) {
                throw new Error('Failed to create user');
            }

            // Then assign them to the business as a student
            const assignRequest: AssignUserToBusinessRequest = {
                userId: newUser.id,
                businessId: business.id,
                role: 'STUDENT',
            };

            await BusinessUsersService.postApiUsersAssignToBusiness(assignRequest);

            resetForm();
            onStudentAdded();
            onClose();
        } catch (err: any) {
            console.error('Error adding student:', err);
            setError(err.body?.message || 'Failed to add student');
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
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={handleClose}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-blue-600">
                    <h2 className="text-xl font-semibold text-white">Add New Student</h2>
                    <button
                        onClick={handleClose}
                        className="p-1 text-white/80 hover:text-white transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <div>
                        <Label htmlFor="student-name" className="mb-1 block">
                            Full Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="student-name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter student's full name"
                            className="focus-visible:ring-blue-500"
                            disabled={loading}
                        />
                    </div>

                    <div>
                        <Label htmlFor="student-email" className="mb-1 block">
                            Email Address <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="student-email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter student's email"
                            className="focus-visible:ring-blue-500"
                            disabled={loading}
                        />
                    </div>

                    <div>
                        <Label htmlFor="student-password" className="mb-1 block">
                            Password <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="student-password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Create a password for the student"
                            className="focus-visible:ring-blue-500"
                            disabled={loading}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            The student will use this to log in to their account
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end space-x-3 pt-4">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={handleClose}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-700"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Adding...
                                </>
                            ) : (
                                <>
                                    <UserPlus className="h-4 w-4 mr-2" />
                                    Add Student
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}