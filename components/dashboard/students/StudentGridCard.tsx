import { useState } from 'react';
import { 
    ChevronDown, 
    ChevronUp, 
    MoreVertical, 
    Eye, 
    Edit, 
    Trash2,
    Phone,
    Mail,
    BookOpen
} from 'lucide-react';

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

interface StudentGridCardProps {
    student: StudentData;
    isExpanded: boolean;
    onClick: () => void;
    onViewDetails: () => void;
    onEdit: () => void;
    onDelete: () => void;
}

export function StudentGridCard({
    student,
    isExpanded,
    onClick,
    onViewDetails,
    onEdit,
    onDelete,
}: StudentGridCardProps) {
    const [showMenu, setShowMenu] = useState(false);

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
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {/* Main Card */}
            <div
                className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={onClick}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        {/* Avatar */}
                        <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                            {getInitials(student.name)}
                        </div>

                        {/* Student Info */}
                        <div>
                            <h3 className="font-semibold text-gray-900">{student.name}</h3>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                                {student.batches.length > 0 && (
                                    <div className="flex items-center">
                                        <BookOpen className="h-4 w-4 mr-1" />
                                        <span>{student.batches[0].batchName}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        {/* Status Badge */}
                        <span
                            className={`px-2 py-1 text-xs rounded-full ${
                                student.isActive
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-gray-100 text-gray-600'
                            }`}
                        >
                            {student.isActive ? 'Active' : 'Inactive'}
                        </span>

                        {/* Expand/Collapse */}
                        {isExpanded ? (
                            <ChevronUp className="h-5 w-5 text-gray-400" />
                        ) : (
                            <ChevronDown className="h-5 w-5 text-gray-400" />
                        )}

                        {/* Menu */}
                        <div className="relative">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowMenu(!showMenu);
                                }}
                                className="p-1 hover:bg-gray-200 rounded"
                            >
                                <MoreVertical className="h-4 w-4 text-gray-500" />
                            </button>

                            {showMenu && (
                                <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[120px]">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onEdit();
                                            setShowMenu(false);
                                        }}
                                        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center"
                                    >
                                        <Edit className="h-4 w-4 mr-2" />
                                        Edit
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onDelete();
                                            setShowMenu(false);
                                        }}
                                        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 text-red-600 flex items-center"
                                    >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Delete
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Expanded Content */}
            {isExpanded && (
                <div className="border-t border-gray-200 bg-gray-50 p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        {/* Contact Info */}
                        <div className="space-y-2">
                            <div className="flex items-center text-sm text-gray-600">
                                <Phone className="h-4 w-4 mr-2" />
                                <span>{student.phone}</span>
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                                <Mail className="h-4 w-4 mr-2" />
                                <span>{student.email}</span>
                            </div>
                        </div>

                        {/* Batch Info */}
                        <div className="space-y-2">
                            {student.batches.map((batch, index) => (
                                <div key={index} className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600">{batch.courseName}</span>
                                    <span
                                        className={`px-2 py-1 text-xs rounded-full ${getFeeStatusColor(
                                            batch.feeStatus
                                        )}`}
                                    >
                                        {batch.feeStatus}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* View Details Button */}
                    <div className="flex justify-center">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onViewDetails();
                            }}
                            className="flex items-center px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}