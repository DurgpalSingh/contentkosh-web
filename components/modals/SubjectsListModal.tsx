'use client';

import { useState } from 'react';
import { X, Plus, Edit, Trash2, FileText, Calendar } from 'lucide-react';
import { Course, Subject } from '@/lib/api';

interface SubjectsListModalProps {
    isOpen: boolean;
    onClose: () => void;
    course: Course;
    examId?: number;
    onAddSubject: () => void;
    onEditSubject: (subject: Subject) => void;
    onDeleteSubject: (subject: Subject) => void;
}

export function SubjectsListModal({
    isOpen,
    onClose,
    course,
    onAddSubject,
    onEditSubject,
    onDeleteSubject
}: SubjectsListModalProps) {
    if (!isOpen) return null;

    const subjects = course.subjects || [];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[80vh]">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">Manage Subjects</h2>
                        <p className="text-sm text-slate-500 mt-1">
                            {course.name} ({subjects.length} subjects)
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-slate-500 rounded-full hover:bg-slate-100 transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {subjects.length === 0 ? (
                        <div className="text-center py-12 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 mb-4">
                                <FileText className="h-6 w-6 text-blue-600" />
                            </div>
                            <h3 className="text-lg font-medium text-slate-900 mb-2">No subjects yet</h3>
                            <p className="text-slate-500 mb-6">
                                Add subjects to this course to organize content.
                            </p>
                            <button
                                onClick={onAddSubject}
                                className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                            >
                                <Plus className="h-5 w-5 mr-2" />
                                Add First Subject
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex justify-end mb-4">
                                <button
                                    onClick={onAddSubject}
                                    className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                                >
                                    <Plus className="h-4 w-4 mr-1.5" />
                                    Add Subject
                                </button>
                            </div>
                            <div className="grid gap-4">
                                {subjects.map((subject) => (
                                    <div
                                        key={subject.id}
                                        className="bg-white border border-slate-200 rounded-lg p-4 hover:shadow-sm transition-shadow flex items-center justify-between group"
                                    >
                                        <div className="flex items-center space-x-4">
                                            <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                                                <FileText className="h-5 w-5 text-blue-600" />
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-medium text-slate-900">
                                                    {subject.name}
                                                </h3>
                                                {subject.description && (
                                                    <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                                                        {subject.description}
                                                    </p>
                                                )}
                                                <div className="flex items-center mt-1 space-x-3 text-xs text-slate-400">
                                                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${subject.isActive ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-600'
                                                        }`}>
                                                        {subject.isActive ? 'Active' : 'Inactive'}
                                                    </span>
                                                    <span>
                                                        Created {subject.createdAt ? new Date(subject.createdAt).toLocaleDateString() : 'N/A'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => onEditSubject(subject)}
                                                className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                                title="Edit Subject"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => onDeleteSubject(subject)}
                                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                                title="Delete Subject"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors bg-white"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
