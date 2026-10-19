'use client'

import { useRef } from 'react'
import { SUBJECTIVE_TEST_UPLOAD } from '@/lib/tests/subjectiveTest.config'

const MB = 1024 * 1024

/** Validates a picked file against the subjective PDF rules; returns an error message or null. */
export function getSubjectivePdfError(file: File): string | null {
  const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
  if (!isPdf) return 'Please choose a PDF file'
  if (file.size > SUBJECTIVE_TEST_UPLOAD.maxPdfSizeMb * MB) {
    return `File must be ${SUBJECTIVE_TEST_UPLOAD.maxPdfSizeMb} MB or less`
  }
  return null
}

/** Compact "Choose File | name" row for picking one PDF. */
export function SubjectivePdfPicker({
  file,
  onChange,
  onError,
  disabled = false,
}: {
  file: File | null
  onChange: (file: File | null) => void
  onError: (message: string | null) => void
  disabled?: boolean
}) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = e.target.files?.[0] ?? null
    e.target.value = ''
    if (!picked) return
    const error = getSubjectivePdfError(picked)
    onError(error)
    onChange(error ? null : picked)
  }

  return (
    <label
      className={`flex h-12 flex-1 items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 text-sm ${
        disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:bg-gray-100'
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept={SUBJECTIVE_TEST_UPLOAD.accept}
        className="sr-only"
        onChange={handleChange}
        disabled={disabled}
      />
      <span className="font-semibold text-gray-900">Choose File</span>
      <span className="truncate text-gray-600">{file ? file.name : 'No file chosen'}</span>
    </label>
  )
}
