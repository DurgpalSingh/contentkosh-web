'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { useEffect, useState } from 'react';

interface ContactItem {
  label: string;
  value: string;
}

interface Subsection {
  subheading: string;
  content: string;
  listItems?: string[];
}

interface Section {
  heading: string;
  content?: string;
  listItems?: string[];
  subsections?: Subsection[];
  contactItems?: ContactItem[];
}

interface ContentData {
  title: string;
  lastUpdated: string;
  sections: Section[];
}

interface ContentPageProps {
  contentPath: string;
}

export default function ContentPage({ contentPath }: ContentPageProps) {
  const [content, setContent] = useState<ContentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        const response = await fetch(contentPath);
        if (!response.ok) {
          throw new Error('Failed to load content');
        }
        const data = await response.json();
        setContent(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        setContent(null);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [contentPath]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-cyan-600"></div>
          <p className="mt-4 text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !content) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 font-semibold">Error: {error || 'Content not found'}</p>
          <Button
            onClick={() => window.history.back()}
            className="mt-4 rounded-xl bg-slate-900 px-6 py-2 text-white transition hover:bg-slate-800"
          >
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
          <Link href="/" className="inline-block">
            <Image
              src="/logo.png"
              alt="Logo"
              width={140}
              height={56}
              className="h-8 w-auto"
            />
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="mb-2 text-4xl font-bold text-slate-900">{content.title}</h1>
          <p className="mb-8 text-sm text-slate-600">
            Last updated: {new Date(content.lastUpdated).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>

          <div className="prose prose-sm max-w-none text-slate-700">
            {content.sections.map((section, index) => (
              <section key={index} className="mb-8">
                <h2 className="mb-4 text-2xl font-semibold text-slate-900">{section.heading}</h2>

                {section.content && (
                  <p className={section.listItems || section.subsections ? 'mb-4' : ''}>
                    {section.content}
                  </p>
                )}

                {/* Render list items */}
                {section.listItems && section.listItems.length > 0 && (
                  <ul className="mb-4 list-inside list-disc space-y-2">
                    {section.listItems.map((item, itemIndex) => (
                      <li key={itemIndex}>{item}</li>
                    ))}
                  </ul>
                )}

                {/* Render subsections */}
                {section.subsections && section.subsections.length > 0 && (
                  <div className="space-y-6">
                    {section.subsections.map((subsection, subIndex) => (
                      <div key={subIndex}>
                        <h3 className="mb-3 text-lg font-semibold text-slate-800">
                          {subsection.subheading}
                        </h3>
                        {subsection.content && (
                          <p className={subsection.listItems ? 'mb-4' : ''}>
                            {subsection.content}
                          </p>
                        )}
                        {subsection.listItems && subsection.listItems.length > 0 && (
                          <ul className="list-inside list-disc space-y-2">
                            {subsection.listItems.map((item, itemIndex) => (
                              <li key={itemIndex}>{item}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Render contact items */}
                {section.contactItems && section.contactItems.length > 0 && (
                  <ul className="mt-4 list-inside list-disc space-y-2">
                    {section.contactItems.map((item, itemIndex) => (
                      <li key={itemIndex}>
                        <strong>{item.label}:</strong> {item.value}
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </div>
        </div>

        {/* Back Button */}
        <div className="mt-8">
          <Button
            onClick={() => window.history.back()}
            className="rounded-xl bg-slate-900 px-6 py-2 text-white transition hover:bg-slate-800"
          >
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
}
