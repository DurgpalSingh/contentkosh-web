'use client';

import { BusinessUser } from '@/lib/api';
import { Filter, Search } from 'lucide-react';

export type RoleFilter = 'ALL' | BusinessUser.role;

interface UsersFilterBarProps {
  searchQuery: string;
  selectedRole: RoleFilter;
  roleOptions: RoleFilter[];
  onSearchQueryChange: (value: string) => void;
  onRoleChange: (value: RoleFilter) => void;
}

export function UsersFilterBar({
  searchQuery,
  selectedRole,
  roleOptions,
  onSearchQueryChange,
  onRoleChange,
}: UsersFilterBarProps) {
  return (
    <div className="flex flex-col md:flex-row gap-3">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(event) => onSearchQueryChange(event.target.value)}
          placeholder="Search by name, email, or mobile"
          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="relative md:w-56">
        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        <select
          value={selectedRole}
          onChange={(event) => onRoleChange(event.target.value as RoleFilter)}
          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {roleOptions.map((roleOption) => (
            <option key={roleOption} value={roleOption}>
              {roleOption === 'ALL' ? 'All Roles' : roleOption}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
