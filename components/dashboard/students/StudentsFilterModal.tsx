import { Search } from 'lucide-react';

interface StudentsFilterModalProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    selectedBatch: string;
    onBatchChange: (batch: string) => void;
    selectedStatus: string;
    onStatusChange: (status: string) => void;
    batchOptions: string[];
}

export function StudentsFilterModal({
    searchQuery,
    onSearchChange,
    selectedBatch,
    onBatchChange,
    selectedStatus,
    onStatusChange,
    batchOptions,
}: StudentsFilterModalProps) {
    return (
        <div className="mb-6 flex items-center gap-4">
            {/* Search Bar - Full Width */}
            
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search students..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
            </div>

            {/* Batch Select */}
            <select
                value={selectedBatch}
                onChange={(e) => onBatchChange(e.target.value)}
                className="w-40 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
                {batchOptions.map((batch) => (
                    <option key={batch} value={batch}>
                        {batch}
                    </option>
                ))}
            </select>

            {/* Status Select */}
            <select
                value={selectedStatus}
                onChange={(e) => onStatusChange(e.target.value)}
                className="w-36 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
                <option value="All Status">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
            </select>
        </div>
    );
}
