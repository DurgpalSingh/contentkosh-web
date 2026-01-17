import { Search } from 'lucide-react';

interface StudentsFiltersProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    selectedBatch: string;
    onBatchChange: (batch: string) => void;
    selectedStatus: string;
    onStatusChange: (status: string) => void;
    batchOptions: string[];
}

export function StudentsFilters({
    searchQuery,
    onSearchChange,
    selectedBatch,
    onBatchChange,
    selectedStatus,
    onStatusChange,
    batchOptions,
}: StudentsFiltersProps) {
    return (
        <div className="mb-6 space-y-4">
            <div className="relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search students..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
            </div>

            <div className="flex gap-4">
                <select
                    value={selectedBatch}
                    onChange={(e) => onBatchChange(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                    {batchOptions.map((batch) => (
                        <option key={batch} value={batch}>
                            {batch}
                        </option>
                    ))}
                </select>

                <select
                    value={selectedStatus}
                    onChange={(e) => onStatusChange(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                    <option value="All Status">All Status</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                </select>
            </div>
        </div>
    );
}