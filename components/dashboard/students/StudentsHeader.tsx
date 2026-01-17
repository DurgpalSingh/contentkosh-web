import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface StudentsHeaderProps {
    totalStudents: number;
    onAddStudent: () => void;
}

export function StudentsHeader({ totalStudents, onAddStudent }: StudentsHeaderProps) {
    return (
        <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Students</h1>
                    <p className="text-gray-600">Manage all enrolled students across batches</p>
                </div>
                <Button
                    onClick={onAddStudent}
                    className="bg-blue-600 hover:bg-blue-700"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Student
                </Button>
            </div>
        </div>
    );
}