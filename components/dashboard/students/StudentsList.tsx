import { StudentGridCard } from './StudentGridCard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

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

interface StudentsListProps {
    students: StudentData[];
    loading: boolean;
    error: string | null;
    expandedStudent: number | null;
    onStudentClick: (studentId: number) => void;
    onViewDetails: (student: StudentData) => void;
    onEditStudent: (student: StudentData) => void;
    onDeleteStudent: (student: StudentData) => void;
}

export function StudentsList({
    students,
    loading,
    error,
    expandedStudent,
    onStudentClick,
    onViewDetails,
    onEditStudent,
    onDeleteStudent,
}: StudentsListProps) {
    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-12 text-red-600">
                {error}
            </div>
        );
    }

    if (students.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">No students found</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {students.map((student) => (
                <StudentGridCard
                    key={student.id}
                    student={student}
                    isExpanded={expandedStudent === student.id}
                    onClick={() => onStudentClick(student.id)}
                    onViewDetails={() => onViewDetails(student)}
                    onEdit={() => onEditStudent(student)}
                    onDelete={() => onDeleteStudent(student)}
                />
            ))}
        </div>
    );
}