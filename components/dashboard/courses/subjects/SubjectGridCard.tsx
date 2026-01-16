'use client';

import { useState } from 'react';
import { MoreVertical, Edit, Trash2, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Subject } from '@/lib/api';

interface SubjectGridCardProps {
  subject: Subject;
  onEdit?: (subject: Subject) => void;
  onDelete?: (subject: Subject) => void;
}

export function SubjectGridCard({
  subject,
  onEdit,
  onDelete,
}: SubjectGridCardProps) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="group relative rounded-xl border border-slate-200 bg-white p-4 hover:bg-slate-50 transition-colors duration-150">
      <div className="flex items-start gap-4">
        {/* Icon block */}
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
          <BookOpen className="h-5 w-5" />
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <h3
            className="text-sm font-semibold text-slate-900 leading-snug line-clamp-2"
            title={subject.name}
          >
            {subject.name}
          </h3>

          <p className="mt-1 text-sm text-slate-600 line-clamp-2">
            {subject.description || (
              <span className="text-slate-400 italic">No description provided</span>
            )}
          </p>

          <div className="mt-2 text-xs text-slate-400">
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${subject.status === 'ACTIVE'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-slate-100 text-slate-800'
                }`}
            >
              {subject.status === 'ACTIVE' ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>

        {/* Actions */}
        {(onEdit || onDelete) && (
          <div className="relative opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-slate-500 hover:text-slate-700 hover:bg-slate-200"
              onClick={() => setShowMenu(!showMenu)}
              aria-label="Open menu"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>

            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 mt-1 w-36 rounded-lg border border-slate-200 bg-white shadow-lg z-20 py-1">
                  {onEdit && (
                    <Button
                      variant="ghost"
                      className="w-full justify-start px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                      onClick={() => {
                        setShowMenu(false);
                        onEdit(subject);
                      }}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                  )}

                  {onDelete && (
                    <Button
                      variant="ghost"
                      className="w-full justify-start px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700"
                      onClick={() => {
                        setShowMenu(false);
                        onDelete(subject);
                      }}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}