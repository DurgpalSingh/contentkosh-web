'use client';

import { useState } from 'react';
import { X, User, Mail, Phone, Calendar, BookOpen, DollarSign, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface StudentData {
    id: number;
    userId: number;
    name: string;
    email: string;
    phone?: string;
    isActive: boolean;
    role: string;
    createdAt?: string;
    batches: Array<{
        batchId: number;
        batchName: string;
        batchCode: string;
        courseName: string;
        enrolledAt: string;
        isActive: boolean;
        feeStatus: 'Paid' | 'Pending' | 'Partial' | 'Overdue';
    }>;
}

interface StudentDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    student: StudentData;
}

export function StudentDetailsModal({ isOpen, onClose, student }: StudentDetailsModalProps) {
    if (!isOpen) return null;

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const getFeeStatusColor = (status: string) => {
        switch (status) {
            case 'Paid':
                return 'bg-green-100 text-green-700';
            case 'Pending':
                return 'bg-yellow-100 text-yellow-700';
            case 'Partial':
                return 'bg-orange-100 text-orange-700';
            case 'Overdue':
                return 'bg-red-100 text-red-700';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-blue-600">
                    <h2 className="text-xl font-semibold text-white">Student Details</h2>
                    <button
                        onClick={onClose}
                        className="p-1 text-white/80 hover:text-white transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {/* Student Profile */}
                    <div className="flex items-center space-x-6 mb-8">
                        <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-2xl font-bold">
                            {getInitials(student.name)}
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-gray-900">{student.name}</h3>
                            <p className="text-gray-600">{student.role}</p>
                            <span
                                className={`inline-block px-3 py-1 text-sm rounded-full mt-2 ${
                                    student.isActive
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-gray-100 text-gray-600'
                                }`}
                            >
                                {student.isActive ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                    </div>

                    {/* Contact Information */}
                    <div className="mb-8">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                <Mail className="h-5 w-5 text-gray-500" />
                                <div>
                                    <p className="text-sm text-gray-500">Email</p>
                                    <p className="font-medium text-gray-900">{student.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                <Phone className="h-5 w-5 text-gray-500" />
                                <div>
                                    <p className="text-sm text-gray-500">Phone</p>
                                    <p className="font-medium text-gray-900">{student.phone || 'Not provided'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Enrollment Information */}
                    <div className="mb-8">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">Enrollment Information</h4>
                        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                            <Calendar className="h-5 w-5 text-gray-500" />
                            <div>
                                <p className="text-sm text-gray-500">Joined Date</p>
                                <p className="font-medium text-gray-900">
                                    {student.createdAt 
                                        ? new Date(student.createdAt).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })
                                        : 'Not available'
                                    }
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Batch Enrollments */}
                    <div className="mb-6">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">
                            Batch Enrollments ({student.batches.length})
                        </h4>
                        {student.batches.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <BookOpen className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                                <p>No batch enrollments found</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {student.batches.map((batch, index) => (
                                    <div
                                        key={index}
                                        className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <div>
                                                <h5 className="font-semibold text-gray-900">{batch.batchName}</h5>
                                                <p className="text-sm text-gray-600">{batch.courseName}</p>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-sm font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                                    {batch.batchCode}
                                                </span>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center justify-between text-sm">
                                            <div className="flex items-center space-x-4">
                                                <div className="flex items-center text-gray-600">
                                                    <Calendar className="h-4 w-4 mr-1" />
                                                    <span>
                                                        Enrolled: {new Date(batch.enrolledAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <span
                                                    className={`px-2 py-1 text-xs rounded-full ${
                                                        batch.isActive
                                                            ? 'bg-green-100 text-green-700'
                                                            : 'bg-gray-100 text-gray-600'
                                                    }`}
                                                >
                                                    {batch.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </div>
                                            <div className="flex items-center">
                                                <DollarSign className="h-4 w-4 mr-1 text-gray-500" />
                                                <span
                                                    className={`px-2 py-1 text-xs rounded-full ${getFeeStatusColor(
                                                        batch.feeStatus
                                                    )}`}
                                                >
                                                    {batch.feeStatus}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Additional Information */}
                    <div className="mb-6">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                <User className="h-5 w-5 text-gray-500" />
                                <div>
                                    <p className="text-sm text-gray-500">Student ID</p>
                                    <p className="font-medium text-gray-900">STU-{student.id.toString().padStart(4, '0')}</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                <MapPin className="h-5 w-5 text-gray-500" />
                                <div>
                                    <p className="text-sm text-gray-500">Address</p>
                                    <p className="font-medium text-gray-900">Not provided</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}