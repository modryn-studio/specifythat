'use client';

import { useState, useRef, useEffect } from 'react';

interface SpecDisplayProps {
  spec: string;
  onStartOver: () => void;
  projectName?: string;
}

export function SpecDisplay({ spec, onStartOver, projectName = 'project' }: SpecDisplayProps) {
  const [copied, setCopied] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(spec);
      setCopied(true);
      setDropdownOpen(false);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleDownload = () => {
    try {
      // Create a sanitized filename from project name
      const sanitizedName = projectName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      const filename = `${sanitizedName}-spec.md`;

      // Create blob and download
      const blob = new Blob([spec], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      setDropdownOpen(false);
    } catch (err) {
      console.error('Failed to download:', err);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [dropdownOpen]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Your Spec is Ready! 🎉
          </h1>
          <p className="text-gray-600 mt-1">
            Copy it and paste into ChatGPT, Claude, or your favorite AI to start building.
          </p>
        </div>
        
        <div className="flex gap-3">
          <div className="relative" ref={dropdownRef}>
            <div className="flex">
              <button
                onClick={handleCopy}
                className={`px-4 py-2 rounded-l-lg font-medium transition-all ${
                  copied
                    ? 'bg-green-100 text-green-700 border border-green-300'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {copied ? '✓ Copied!' : 'Copy'}
              </button>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className={`px-2 py-2 rounded-r-lg font-medium transition-all border-l ${
                  copied
                    ? 'bg-green-100 text-green-700 border-green-300'
                    : 'bg-blue-600 text-white hover:bg-blue-700 border-blue-500'
                }`}
                aria-label="More options"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
            </div>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-lg bg-white shadow-lg border border-gray-200 py-1 z-10">
                <button
                  onClick={handleDownload}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  Download as Markdown
                </button>
              </div>
            )}
          </div>
          
          <button
            onClick={onStartOver}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Start Over
          </button>
        </div>
      </div>

      <div className="bg-gray-900 rounded-lg overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
          <span className="text-sm text-gray-400">project-spec.md</span>
          <button
            onClick={handleCopy}
            className="text-gray-400 hover:text-white transition-colors text-sm"
          >
            {copied ? '✓ Copied' : 'Copy'}
          </button>
        </div>
        
        <div className="p-4 md:p-6 overflow-x-auto">
          <pre className="text-gray-100 text-sm md:text-base whitespace-pre-wrap font-mono leading-relaxed">
            {spec}
          </pre>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">💡 What's Next?</h3>
        <ol className="text-blue-800 space-y-1 list-decimal list-inside text-sm">
          <li>Copy the spec above</li>
          <li>Paste it into ChatGPT, Claude, or Cursor</li>
          <li>Say: "Help me build this following the spec exactly"</li>
          <li>Start coding with clear direction</li>
        </ol>
      </div>
    </div>
  );
}
