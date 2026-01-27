'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { AddSubjectModal } from '@/components/modals/AddSubjectModal';
import { EditSubjectModal } from '@/components/modals/EditSubjectModal';
import { DeleteConfirmModal } from '@/components/modals/DeleteConfirmModal';
import { CoursesService, SubjectsService, Subject, Course } from '@/lib/api';
import { Plus, ArrowLeft, BookOpen } from 'lucide-react';
import { SubjectGridCard } from '@/components/dashboard/courses/subjects/SubjectGridCard';

export default function CourseSubjectsPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const courseId = Number(params?.courseId);
  const examId = Number(searchParams.get('examId')) || undefined;

  const [course, setCourse] = useState<Course | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);

  const fetchData = useCallback(async () => {
    if (!courseId || !examId) return;

    setLoading(true);
    try {
      const response = await CoursesService.getApiExamsCourses1(
        examId,
        courseId,
        undefined,
        'subjects'
      );

      const data = response.data as Course | undefined;
      setCourse(data || null);
      const sortedSubjects = [...(data?.subjects || [])].sort(
        (a, b) =>
          new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      );
      setSubjects(sortedSubjects);
      setError(null);
    } catch (err) {
      console.error('Failed to load course subjects', err);
      setError('Failed to load subjects.');
    } finally {
      setLoading(false);
    }
  }, [examId, courseId]);

  useEffect(() => {
    if (examId && courseId) fetchData();
  }, [examId, courseId, fetchData]);

  const handleAdd = () => setIsAddOpen(true);

  const handleEdit = (s: Subject) => {
    setSelectedSubject(s);
    setIsEditOpen(true);
  };

  const handleDelete = (s: Subject) => {
    setSelectedSubject(s);
    setIsDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedSubject?.id || !examId || !courseId) return;

    try {
      await SubjectsService.deleteApiExamsCoursesSubjects(
        examId,
        courseId,
        selectedSubject.id
      );
      setIsDeleteOpen(false);
      setSelectedSubject(null);
      await fetchData();
    } catch (err) {
      console.error('Failed to delete subject', err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-start gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="mt-1 rounded-md p-1.5 text-slate-500 hover:bg-slate-100"
              onClick={() => router.back()}
              aria-label="Go back"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>

            <div>
              <h1 className="text-lg font-medium text-slate-500">
                {course?.name || 'Course'}
              </h1>
              <h2 className="text-2xl font-semibold text-slate-900 tracking-tight">
                Subjects
              </h2>
            </div>
          </div>

          <Button
            onClick={handleAdd}
            className="inline-flex items-center gap-2 rounded-lg border border-blue-600 bg-white px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Subject
          </Button>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-200 pt-6" />

        {/* Error */}
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        {/* Content */}
        {subjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 p-14 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-white shadow-sm">
              <BookOpen className="h-6 w-6 text-slate-400" />
            </div>

            <h3 className="text-lg font-semibold text-slate-900">
              No subjects yet
            </h3>

            <p className="mt-1 max-w-sm text-sm text-slate-600">
              Start by adding subjects to organize lessons and materials for this course.
            </p>

            <Button
              onClick={handleAdd}
              className="mt-6 inline-flex items-center gap-2 rounded-lg border border-blue-600 bg-white px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50"
            >
              <Plus className="h-4 w-4" />
              Add Subject
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {subjects.map((subject) => (
              <SubjectGridCard
                key={subject.id}
                subject={subject}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {isAddOpen && examId && courseId && (
        <AddSubjectModal
          isOpen={isAddOpen}
          onClose={() => setIsAddOpen(false)}
          examId={examId}
          courseId={courseId}
          onSubjectCreated={fetchData}
        />
      )}

      {isEditOpen && selectedSubject && examId && courseId && (
        <EditSubjectModal
          isOpen={isEditOpen}
          onClose={() => {
            setIsEditOpen(false);
            setSelectedSubject(null);
          }}
          examId={examId}
          courseId={courseId}
          subject={selectedSubject}
          onSubjectUpdated={fetchData}
        />
      )}

      {isDeleteOpen && selectedSubject && (
        <DeleteConfirmModal
          isOpen={isDeleteOpen}
          onClose={() => {
            setIsDeleteOpen(false);
            setSelectedSubject(null);
          }}
          onConfirm={confirmDelete}
          title="Delete Subject"
          message="Are you sure you want to delete this subject? This action cannot be undone."
          itemName={selectedSubject.name}
        />
      )}
    </>
  );
}