'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface LanguageInputChipsProps {
  languages: string[];
  onChange: (next: string[]) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function LanguageInputChips({
  languages,
  onChange,
  disabled = false,
  placeholder = 'e.g., English, Hindi',
}: LanguageInputChipsProps) {
  const [languageInput, setLanguageInput] = useState('');

  const handleAddLanguage = () => {
    const value = languageInput.trim();
    if (!value || languages.includes(value)) return;
    onChange([...languages, value]);
    setLanguageInput('');
  };

  const handleRemoveLanguage = (lang: string) => {
    onChange(languages.filter((item) => item !== lang));
  };

  return (
    <>
      <div className="mb-2 flex gap-2">
        <Input
          type="text"
          value={languageInput}
          onChange={(e) => setLanguageInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAddLanguage();
            }
          }}
          placeholder={placeholder}
          className="w-full rounded-lg border border-gray-300 px-4 py-2 transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500 disabled:opacity-70"
          disabled={disabled}
        />
        <Button
          type="button"
          onClick={handleAddLanguage}
          className="bg-blue-600 text-white hover:bg-blue-700"
          disabled={disabled || !languageInput.trim()}
        >
          Add
        </Button>
      </div>

      {languages.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {languages.map((lang) => (
            <span
              key={lang}
              className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800"
            >
              {lang}
              <button
                type="button"
                onClick={() => handleRemoveLanguage(lang)}
                className="text-blue-800 hover:text-blue-900"
                disabled={disabled}
              >
                x
              </button>
            </span>
          ))}
        </div>
      )}
    </>
  );
}
