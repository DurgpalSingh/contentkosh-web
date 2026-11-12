'use client';

import { Edit, Trash2, Eye, FileText, FileImage, Calendar, HardDrive, User, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { OverviewCard, OverviewCardMenuItem } from '@/components/common/OverviewCard';
import { Content } from '@/lib/api';

interface ContentGridCardProps {
  content: Content;
  onView: (content: Content) => void;
  onEdit?: (content: Content) => void;
  onDelete?: (content: Content) => void;
}

export function ContentGridCard({ content, onView, onEdit, onDelete }: ContentGridCardProps) {
  const menuItems: OverviewCardMenuItem[] = [];
  if (onEdit) {
    menuItems.push({ label: 'Edit', icon: Edit, onClick: () => onEdit(content) });
  }
  if (onDelete) {
    menuItems.push({ label: 'Delete', icon: Trash2, onClick: () => onDelete(content), variant: 'danger' });
  }

  const formatBytes = (bytes?: number) => {
    if (bytes === undefined || bytes === null) return 'Unknown size';
    if (bytes === 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB'];
    const exp = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
    const value = bytes / Math.pow(1024, exp);
    return `${value.toFixed(exp === 0 ? 0 : 1)} ${units[exp]}`;
  };

  const uploadedAt = content.createdAt ? new Date(content.createdAt).toLocaleString() : 'Unknown date';

  const typeMeta = (() => {
    const raw = content.type?.toLowerCase() ?? 'file';
    if (raw.includes('pdf')) return { label: 'PDF', Icon: FileText, badge: 'bg-rose-50 text-rose-700 border-rose-200', icon: 'bg-rose-50 text-rose-600' };
    if (raw.includes('image') || raw.includes('jpg') || raw.includes('png')) return { label: 'Image', Icon: FileImage, badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: 'bg-emerald-50 text-emerald-600' };
    if (raw.includes('doc')) return { label: 'DOC', Icon: FileText, badge: 'bg-amber-50 text-amber-700 border-amber-200', icon: 'bg-amber-50 text-amber-600' };
    return { label: content.type || 'File', Icon: FileText, badge: 'bg-blue-50 text-blue-700 border-blue-200', icon: 'bg-blue-50 text-blue-600' };
  })();


  const statusBadge = content.status ? (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${
        content.status === 'ACTIVE'
          ? 'bg-green-50 text-green-700 border-green-200'
          : 'bg-slate-100 text-slate-600 border-slate-200'
      }`}
    >
      {content.status === 'ACTIVE' ? 'Active' : 'Inactive'}
    </span>
  ) : null;

  return (
    <OverviewCard
      icon={
        <div className={`h-12 w-12 rounded-lg border border-slate-200 flex items-center justify-center ${typeMeta.icon}`}>
          <typeMeta.Icon className="h-6 w-6" />
        </div>
      }
      title={content.title || 'Untitled'}
      badges={[statusBadge].filter(Boolean)}
      menuItems={menuItems}
      footer={
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1 border-blue-200 text-blue-700 hover:border-blue-400 hover:bg-blue-50"
            onClick={() => onView(content)}
          >
            <Eye className="h-4 w-4 mr-2" />
            View File
          </Button>
        </div>
      }
    >
      <div className="space-y-3 text-sm text-slate-600">
        <div className="flex min-w-0 items-center">
          <HardDrive className="h-4 w-4 mr-2 shrink-0 text-slate-400" />
          <span className="truncate">{formatBytes(content.fileSize)}</span>
        </div>
        <div className="flex min-w-0 items-center">
          <User className="h-4 w-4 mr-2 shrink-0 text-slate-400" />
          <span className="truncate" title={content.uploader?.name || 'Unknown User'}>
            Upload By: {content.uploader?.name || 'Unknown User'}
          </span>
        </div>
        <div className="flex min-w-0 items-center">
          <BookOpen className="h-4 w-4 mr-2 shrink-0 text-slate-400" />
          <span className="truncate" title={content.subject?.name || 'Unassigned'}>
            Subject: {content.subject?.name || 'Unassigned'}
          </span>
        </div>
        <div className="flex min-w-0 items-center">
          <Calendar className="h-4 w-4 mr-2 shrink-0 text-slate-400" />
          <span className="truncate" title={uploadedAt}>{uploadedAt}</span>
        </div>
      </div>
    </OverviewCard>
  );
}
