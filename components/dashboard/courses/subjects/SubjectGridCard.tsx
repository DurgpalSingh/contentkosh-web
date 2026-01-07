import { Subject } from '@/lib/api';
import { MoreVertical, Edit, Trash2, BookOpen } from 'lucide-react';
import { useState } from 'react';

interface SubjectGridCardProps {
  subject: Subject;
  onEdit?: (subject: Subject) => void;
  onDelete?: (subject: Subject) => void;
}

export function SubjectGridCard({ subject, onEdit, onDelete }: SubjectGridCardProps) {
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

          {/* <div className="mt-2 text-xs text-slate-400">
            Subject
          </div> */}
        </div>

        {/* Actions */}
        {(onEdit || onDelete) && (
          <div className="relative opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="rounded-full p-1.5 hover:bg-slate-200 text-slate-500"
              aria-label="Open menu"
            >
              <MoreVertical className="h-4 w-4" />
            </button>

            {showMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                <div className="absolute right-0 mt-1 w-32 rounded-lg border border-slate-200 bg-white shadow-lg z-20 py-1">
                  {onEdit && (
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        onEdit(subject);
                      }}
                      className="flex w-full items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        onDelete(subject);
                      }}
                      className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </button>
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