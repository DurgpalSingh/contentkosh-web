'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';

export interface AnnouncementFormValues {
  heading: string;
  content: string;
  startDate: string;
  endDate: string;
  courseId?: number | null;
  batchId?: number | null;
  visibleToTeachers: boolean;
  visibleToStudents: boolean;
}

interface AnnouncementFormProps {
  mode: 'admin' | 'teacher';
  initialValues?: Partial<AnnouncementFormValues>;
  onSubmit: (data: AnnouncementFormValues) => Promise<void>;
  isLoading: boolean;
  courses?: { id: number; name: string }[];
  batches?: { id: number; displayName: string; courseId?: number }[];
}

export function AnnouncementForm({
  mode,
  initialValues,
  onSubmit,
  isLoading,
  courses = [],
  batches = [],
}: AnnouncementFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<AnnouncementFormValues>({
    defaultValues: {
      heading: initialValues?.heading ?? '',
      content: initialValues?.content ?? '',
      startDate: initialValues?.startDate ?? '',
      endDate: initialValues?.endDate ?? '',
      courseId: initialValues?.courseId ?? null,
      batchId: initialValues?.batchId ?? null,
      visibleToTeachers: initialValues?.visibleToTeachers ?? false,
      visibleToStudents: mode === 'teacher' ? true : (initialValues?.visibleToStudents ?? false),
    },
  });

  const selectedCourseId = watch('courseId');
  const visibleToTeachers = watch('visibleToTeachers');
  const visibleToStudents = watch('visibleToStudents');
  const startDate = watch('startDate');

  const filteredBatches =
    mode === 'admin' && selectedCourseId
      ? batches.filter((b) => b.courseId === Number(selectedCourseId))
      : batches;

  useEffect(() => {
    if (mode === 'admin') setValue('batchId', null);
  }, [selectedCourseId, mode, setValue]);

  const courseOptions = [
    { value: '' as string | number, label: 'All courses' },
    ...courses.map((c) => ({ value: c.id, label: c.name })),
  ];
  const batchOptions = [
    { value: '' as string | number, label: 'All batches' },
    ...filteredBatches.map((b) => ({ value: b.id, label: b.displayName })),
  ];

  const handleFormSubmit = handleSubmit((data) => {
    if (mode === 'admin' && !data.visibleToTeachers && !data.visibleToStudents) return;
    onSubmit(data);
  });

  return (
    <form onSubmit={handleFormSubmit} className="space-y-4 p-1">
      <div className="space-y-1">
        <Label htmlFor="heading">Heading</Label>
        <Input
          id="heading"
          {...register('heading', { required: 'Heading is required' })}
          placeholder="Announcement heading"
        />
        {errors.heading && <p className="text-xs text-red-500">{errors.heading.message}</p>}
      </div>

      <div className="space-y-1">
        <Label htmlFor="content">Content</Label>
        <Textarea
          id="content"
          {...register('content', { required: 'Content is required' })}
          placeholder="Write your announcement..."
          rows={4}
        />
        {errors.content && <p className="text-xs text-red-500">{errors.content.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label htmlFor="startDate">Start Date</Label>
          <Input id="startDate" type="date" {...register('startDate', { required: 'Required' })} />
          {errors.startDate && <p className="text-xs text-red-500">{errors.startDate.message}</p>}
        </div>
        <div className="space-y-1">
          <Label htmlFor="endDate">End Date</Label>
          <Input
            id="endDate"
            type="date"
            {...register('endDate', {
              required: 'Required',
              validate: (val) => !startDate || val > startDate || 'Must be after start date',
            })}
          />
          {errors.endDate && <p className="text-xs text-red-500">{errors.endDate.message}</p>}
        </div>
      </div>

      {mode === 'admin' && (
        <div className="space-y-1">
          <Label htmlFor="courseId">Course (optional)</Label>
          <Select
            id="courseId"
            value={selectedCourseId ?? ''}
            onChange={(val) => setValue('courseId', val ? Number(val) : null)}
            options={courseOptions}
          />
        </div>
      )}

      <div className="space-y-1">
        <Label htmlFor="batchId">Batch (optional)</Label>
        <Select
          id="batchId"
          value={watch('batchId') ?? ''}
          onChange={(val) => setValue('batchId', val ? Number(val) : null)}
          options={batchOptions}
          disabled={batchOptions.length <= 1}
        />
      </div>

      <div className="space-y-2">
        <Label>Visibility</Label>
        {mode === 'admin' && (
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" className="h-4 w-4 rounded" {...register('visibleToTeachers')} />
            Visible to Teachers
          </label>
        )}
        <label className={`flex items-center gap-2 text-sm ${mode === 'teacher' ? 'opacity-60' : 'cursor-pointer'}`}>
          <input
            type="checkbox"
            className="h-4 w-4 rounded"
            {...register('visibleToStudents')}
            disabled={mode === 'teacher'}
          />
          Visible to Students
        </label>
        {mode === 'admin' && !visibleToTeachers && !visibleToStudents && (
          <p className="text-xs text-red-500">At least one visibility option must be selected.</p>
        )}
      </div>

      <Button
        type="submit"
        disabled={isLoading || (mode === 'admin' && !visibleToTeachers && !visibleToStudents)}
        className="w-full bg-blue-600 hover:bg-blue-700"
      >
        {isLoading ? 'Saving…' : 'Save Announcement'}
      </Button>
    </form>
  );
}
