'use client';

import { useState, useEffect } from 'react';
import { X, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UsersService, CreateUserRequest } from '@/lib/api';
import { validateEntityName, validateEmail, validateMobile, validatePassword } from '@/lib/validation';
import { USER_ROLES } from '@/lib/constants';
import { toast } from 'sonner';

interface AddUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    businessId: number;
    onUserCreated: () => void;
    defaultRole?: CreateUserRequest.role;
}

export function AddUserModal({
    isOpen,
    onClose,
    businessId,
    onUserCreated,
    defaultRole = CreateUserRequest.role.ADMIN,
}: AddUserModalProps) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [mobile, setMobile] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<CreateUserRequest.role>(defaultRole);
    const [showPassword, setShowPassword] = useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    // Reset form when modal opens/closes or default role changes
    useEffect(() => {
        if (isOpen) {
            setRole(defaultRole);
        }
    }, [isOpen, defaultRole]);

    const resetForm = () => {
        setName('');
        setEmail('');
        setMobile('');
        setPassword('');
        setRole(defaultRole);
        setError(null);
        setShowPassword(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        const nameError = validateEntityName(name, 'Name', 50);
        if (nameError) {
            setError(nameError);
            return;
        }

        const emailError = validateEmail(email);
        if (emailError) {
            setError(emailError);
            return;
        }

        const mobileError = validateMobile(mobile);
        if (mobileError) {
            setError(mobileError);
            return;
        }

        const passwordError = validatePassword(password);
        if (passwordError) {
            setError(passwordError);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const request: CreateUserRequest = {
                name: name.trim(),
                email: email.trim(),
                password: password,
                role: role,
                mobile: mobile.trim() || undefined,
            };

            await UsersService.postApiBusinessUsers(businessId, request);

            resetForm();
            onUserCreated();
            toast.success('User created successfully');
            onClose();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            console.error('Error creating user:', err);
            setError(err.body?.message || 'Failed to create user');
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
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={handleClose}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md overflow-y-auto max-h-[90vh]">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700">
                    <h2 className="text-xl font-semibold text-white">Add New {role === 'ADMIN' ? 'Admin' : 'User'}</h2>

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleClose}
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
                            htmlFor="user-name"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Full Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="user-name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g., John Doe"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            disabled={loading}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label
                            htmlFor="user-email"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Email Address <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="user-email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="john@example.com"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            disabled={loading}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label
                            htmlFor="user-mobile"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Mobile Number <span className="text-gray-400 text-xs">(Optional)</span>
                        </label>
                        <input
                            id="user-mobile"
                            type="tel"
                            value={mobile}
                            onChange={(e) => setMobile(e.target.value)}
                            placeholder="e.g., 9876543210"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            disabled={loading}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label
                            htmlFor="user-role"
                            className="block text-sm font-medium text-gray-700"
                        >
                            User Role <span className="text-red-500">*</span>
                        </label>
                        <select
                            id="user-role"
                            value={role}
                            onChange={(e) => setRole(e.target.value as CreateUserRequest.role)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white cursor-pointer"
                            disabled={loading}
                        >
                            {Object.entries(CreateUserRequest.role).map(([key, value]) => (
                                <option key={key} value={value}>
                                    {USER_ROLES[value].charAt(0).toUpperCase() + USER_ROLES[value].slice(1).toLowerCase()}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-1.5">
                        <label
                            htmlFor="user-password"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Password <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <input
                                id="user-password"
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Min. 6 characters"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors pr-10"
                                disabled={loading}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showPassword ? (
                                    <EyeOff className="h-4 w-4" />
                                ) : (
                                    <Eye className="h-4 w-4" />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end space-x-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
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
                                    Creating...
                                </>
                            ) : (
                                'Create User'
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}

