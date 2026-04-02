'use client';

import dynamic from 'next/dynamic';
import { useMemo } from 'react';

// `react-quill@2.0.x` calls `ReactDOM.findDOMNode`, but React 19 removed it.
// Patch a compatible fallback so Quill can resolve its editing area element.
import ReactDOM from 'react-dom';

type ReactDomLike = { findDOMNode?: (node: unknown) => unknown };
const reactDomLike = ReactDOM as unknown as ReactDomLike;

if (typeof reactDomLike.findDOMNode !== 'function') {
  reactDomLike.findDOMNode = (node: unknown) => node;
}

import 'react-quill/dist/quill.snow.css';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

export function RichTextField({
  value,
  onChange,
  placeholder,
  ariaLabel,
}: {
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  ariaLabel?: string;
}) {
  const modules = useMemo(
    () => ({
      toolbar: [
        [{ header: [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        ['blockquote'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        ['link'],
        ['clean'],
      ],
    }),
    [],
  );

  const formats = useMemo(
    () => [
      'header',
      'bold',
      'italic',
      'underline',
      'strike',
      'blockquote',
      'list',
      'bullet',
      'ordered',
      'link',
    ],
    [],
  );

  return (
    <div aria-label={ariaLabel}>
      <ReactQuill
        theme="snow"
        value={value}
        onChange={(next) => onChange(typeof next === 'string' ? next : '')}
        placeholder={placeholder}
        modules={modules}
        formats={formats}
      />
    </div>
  );
}

