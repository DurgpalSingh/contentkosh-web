'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UsersService, UpdateUserRequest, BusinessUser } from '@/lib/api';
import { validateEntityName, validateMobile } from '@/lib/validation';

interface EditUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: BusinessUser;
    onUserUpdated: () => void;
}

export function EditUserModal({
    isOpen,
    onClose,
    user,
    onUserUpdated,
}: EditUserModalProps) {
    const [name, setName] = useState('');
    const [mobile, setMobile] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        if (isOpen && user.user) {
            setName(user.user.name || '');
            setMobile(user.user.mobile || '');
            setError(null);
        }

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose, user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        const nameError = validateEntityName(name, 'Name', 50);
        if (nameError) {
            setError(nameError);
            return;
        }

        const mobileError = validateMobile(mobile);
        if (mobileError) {
            setError(mobileError);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const request: UpdateUserRequest = {
                name: name.trim(),
                mobile: mobile.trim() || undefined,
            };

            if (user.user?.id) {
                await UsersService.putApiUsers(user.user.id, request);
                onUserUpdated();
                onClose();
            } else {
                setError("User ID missing");
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            console.error('Error updating user:', err);
            setError(err.body?.message || 'Failed to update user');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700">
                    <h2 className="text-xl font-semibold text-white">Edit User</h2>

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        className="text-white/80 hover:text-white hover:bg-white/20"
                    >
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <div className="space-y-1.5">
                        <label
                            htmlFor="edit-user-name"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Full Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="edit-user-name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g., John Doe"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            disabled={loading}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-gray-700">
                            Email Address
                        </label>
                        <input
                            type="email"
                            value={user.user?.email || ''}
                            disabled={true}
                            className="w-full px-4 py-2 border border-gray-200 bg-gray-50 rounded-lg text-gray-500 cursor-not-allowed"
                        />
                        <p className="text-xs text-gray-400">Email cannot be changed</p>
                    </div>

                    <div className="space-y-1.5">
                        <label
                            htmlFor="edit-user-mobile"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Mobile Number <span className="text-gray-400 text-xs">(Optional)</span>
                        </label>
                        <input
                            id="edit-user-mobile"
                            type="tel"
                            value={mobile}
                            onChange={(e) => setMobile(e.target.value)}
                            placeholder="e.g., 9876543210"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            disabled={loading}
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end space-x-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={loading}
                        >
                            Cancel
                        </Button>

                        <Button
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <svg
                                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        />
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        />
                                    </svg>
                                    Saving...
                                </>
                            ) : (
                                'Save Changes'
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
