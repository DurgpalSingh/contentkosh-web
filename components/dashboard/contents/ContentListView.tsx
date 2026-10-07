'use client';

import { useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, Edit, Eye, Trash2 } from 'lucide-react';
import { Content } from '@/lib/api';
import { formatContentBytes, getContentTypeMeta } from './contentDisplay';

type SortKey = 'name' | 'date' | 'type' | 'size' | 'subject' | 'uploader';
type SortDirection = 'asc' | 'desc';

interface ContentListViewProps {
  contents: Content[];
  onView: (content: Content) => void;
  onEdit?: (content: Content) => void;
  onDelete?: (content: Content) => void;
}

const formatModifiedDate = (date?: string) =>
  date
    ? new Date(date).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })
    : '—';

const getSortValue = (content: Content, key: SortKey): string | number => {
  switch (key) {
    case 'name':
      return (content.title ?? '').toLowerCase();
    case 'date':
      return content.createdAt ? new Date(content.createdAt).getTime() : 0;
    case 'type':
      return getContentTypeMeta(content).label.toLowerCase();
    case 'size':
      return content.fileSize ?? 0;
    case 'subject':
      return (content.subject?.name ?? '').toLowerCase();
    case 'uploader':
      return (content.uploader?.name ?? '').toLowerCase();
  }
};

// Text columns start ascending (A→Z), date/size start descending (newest/largest first) — like Windows Explorer
const DEFAULT_DIRECTION: Record<SortKey, SortDirection> = {
  name: 'asc',
  date: 'desc',
  type: 'asc',
  size: 'desc',
  subject: 'asc',
  uploader: 'asc',
};

/**
 * Windows Explorer "Details"-style list of contents.
 * Click a column header to sort; click a row to select, double-click (or Enter) to open.
 */
export function ContentListView({ contents, onView, onEdit, onDelete }: ContentListViewProps) {
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [selectedId, setSelectedId] = useState<number | undefined>(undefined);

  const sortedContents = useMemo(() => {
    const factor = sortDirection === 'asc' ? 1 : -1;
    return [...contents].sort((a, b) => {
      const av = getSortValue(a, sortKey);
      const bv = getSortValue(b, sortKey);
      if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * factor;
      return String(av).localeCompare(String(bv), undefined, { numeric: true }) * factor;
    });
  }, [contents, sortKey, sortDirection]);

  const handleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDirection(DEFAULT_DIRECTION[key]);
    }
  };

  const hasActions = Boolean(onEdit || onDelete);

  const renderHeader = (key: SortKey, label: string, className = '') => {
    const isActive = sortKey === key;
    const SortIcon = sortDirection === 'asc' ? ArrowUp : ArrowDown;
    return (
      <th
        scope="col"
        aria-sort={isActive ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
        className={`border-r border-slate-200 last:border-r-0 p-0 font-medium ${className}`}
      >
        <button
          type="button"
          onClick={() => handleSort(key)}
          className={`flex w-full items-center gap-1 px-3 py-2 text-left hover:bg-slate-100 transition-colors ${
            isActive ? 'text-slate-900' : 'text-slate-600'
          }`}
        >
          <span className="truncate">{label}</span>
          {isActive && <SortIcon className="h-3.5 w-3.5 shrink-0 text-slate-500" />}
        </button>
      </th>
    );
  };

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full table-fixed text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs">
            <tr>
              {renderHeader('name', 'Name', 'w-auto')}
              {renderHeader('date', 'Date modified', 'hidden w-40 md:table-cell')}
              {renderHeader('type', 'Type', 'hidden w-24 sm:table-cell')}
              {renderHeader('size', 'Size', 'w-20 sm:w-24')}
              {renderHeader('subject', 'Subject', 'hidden w-40 lg:table-cell')}
              {renderHeader('uploader', 'Uploaded by', 'hidden w-40 xl:table-cell')}
              <th scope="col" className={`${hasActions ? 'w-24 sm:w-28' : 'w-12'} px-3 py-2`}>
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedContents.map((content) => {
              const typeMeta = getContentTypeMeta(content);
              const isSelected = content.id === selectedId;
              const title = content.title || 'Untitled';
              return (
                <tr
                  key={content.id}
                  tabIndex={0}
                  aria-selected={isSelected}
                  onClick={() => setSelectedId(content.id)}
                  onDoubleClick={() => onView(content)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.target === e.currentTarget) onView(content);
                  }}
                  className={`group cursor-default select-none border-b border-slate-100 last:border-b-0 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-400 ${
                    isSelected ? 'bg-blue-100/70' : 'hover:bg-blue-50/60'
                  }`}
                >
                  <td className="px-3 py-2">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${typeMeta.icon}`}>
                        <typeMeta.Icon className="h-4 w-4" />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-medium text-slate-900" title={title}>
                          {title}
                        </p>
                        <p className="truncate text-xs text-slate-500 md:hidden">
                          {formatModifiedDate(content.createdAt)}
                        </p>
                      </div>
                      {content.status === 'INACTIVE' && (
                        <span className="shrink-0 rounded-full border border-slate-200 bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                          Inactive
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="hidden truncate px-3 py-2 text-slate-600 md:table-cell">
                    {formatModifiedDate(content.createdAt)}
                  </td>
                  <td className="hidden truncate px-3 py-2 text-slate-600 sm:table-cell">{typeMeta.label}</td>
                  <td className="truncate px-3 py-2 text-slate-600 tabular-nums">
                    {formatContentBytes(content.fileSize)}
                  </td>
                  <td
                    className="hidden truncate px-3 py-2 text-slate-600 lg:table-cell"
                    title={content.subject?.name || 'Unassigned'}
                  >
                    {content.subject?.name || 'Unassigned'}
                  </td>
                  <td
                    className="hidden truncate px-3 py-2 text-slate-600 xl:table-cell"
                    title={content.uploader?.name || 'Unknown User'}
                  >
                    {content.uploader?.name || 'Unknown User'}
                  </td>
                  <td className="px-2 py-1.5">
                    <div className="flex items-center justify-end gap-0.5">
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); onView(content); }}
                        className="rounded-md p-1.5 text-slate-500 hover:bg-blue-100 hover:text-blue-700 transition-colors"
                        aria-label={`View ${title}`}
                        title="View file"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      {onEdit && (
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); onEdit(content); }}
                          className="rounded-md p-1.5 text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors"
                          aria-label={`Edit ${title}`}
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      )}
                      {onDelete && (
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); onDelete(content); }}
                          className="rounded-md p-1.5 text-slate-500 hover:bg-red-100 hover:text-red-600 transition-colors"
                          aria-label={`Delete ${title}`}
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="border-t border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-500">
        {contents.length} {contents.length === 1 ? 'item' : 'items'}
        {selectedId !== undefined && contents.some((c) => c.id === selectedId) && ' · 1 item selected'}
      </div>
    </div>
  );
}
