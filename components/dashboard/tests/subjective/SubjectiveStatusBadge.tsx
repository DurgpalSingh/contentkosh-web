'use client'

import { CheckCircle2, Clock, PlayCircle, XCircle, type LucideIcon } from 'lucide-react'
import { SubjectiveDisplayStatus } from '@/lib/api'
import {
  SUBJECTIVE_DISPLAY_STATUS_BADGE,
  SUBJECTIVE_DISPLAY_STATUS_LABEL,
  SUBJECTIVE_STAFF_STATUS_LABEL,
} from '@/lib/tests/subjectiveTestConstants'

const STATUS_ICON: Partial<Record<SubjectiveDisplayStatus, LucideIcon>> = {
  [SubjectiveDisplayStatus.CHECKED]: CheckCircle2,
  [SubjectiveDisplayStatus.SUBMITTED]: Clock,
  [SubjectiveDisplayStatus.IN_PROGRESS]: PlayCircle,
  [SubjectiveDisplayStatus.EXPIRED]: XCircle,
}

/** Pill with icon for a submission status; `audience` picks staff ("Pending") or student ("Submitted") wording. */
export function SubjectiveStatusBadge({
  status,
  audience,
}: {
  status: SubjectiveDisplayStatus
  audience: 'staff' | 'student'
}) {
  const Icon = STATUS_ICON[status]
  const label = audience === 'staff' ? SUBJECTIVE_STAFF_STATUS_LABEL[status] : SUBJECTIVE_DISPLAY_STATUS_LABEL[status]
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${SUBJECTIVE_DISPLAY_STATUS_BADGE[status]}`}
    >
      {Icon && <Icon className="h-3.5 w-3.5" aria-hidden />}
      {label}
    </span>
  )
}

/** Plain pill used for paper type / window state in page headers. */
export function SubjectivePill({ className, children }: { className: string; children: React.ReactNode }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-medium ${className}`}>
      {children}
    </span>
  )
}
