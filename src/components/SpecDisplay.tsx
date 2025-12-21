'use client';

import { useState, useRef, useEffect } from 'react';
import { PartyPopper, Check, Lightbulb } from 'lucide-react';

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
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row gap-6 justify-between items-start sm:items-center">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white flex items-center gap-2">
            Your Spec is Ready! <PartyPopper className="w-8 h-8 text-accent-400" />
          </h1>
          <p className="text-dark-300 mt-2 text-lg">
            Copy it and paste into ChatGPT, Claude, or your favorite AI to start building.
          </p>
        </div>
        
        <div className="flex gap-3">
          <div className="relative" ref={dropdownRef}>
            <div className="flex">
              <button
                onClick={handleCopy}
                className={`px-6 py-3 rounded-l-xl font-bold transition-all ${
                  copied
                    ? 'bg-green-500 text-white shadow-lg shadow-green-500/30'
                    : 'bg-accent-600 hover:bg-accent-500 text-white shadow-lg shadow-accent-600/25 hover:shadow-accent-500/40'
                }`}
              >
                {copied ? (
                  <span className="flex items-center gap-1.5">
                    <Check className="w-4 h-4" /> Copied!
                  </span>
                ) : 'Copy'}
              </button>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className={`px-3 py-3 rounded-r-xl font-bold transition-all border-l border-white/20 ${
                  copied
                    ? 'bg-green-500 text-white'
                    : 'bg-accent-600 hover:bg-accent-500 text-white'
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
              <div className="absolute right-0 mt-2 w-64 rounded-xl bg-dark-800 shadow-2xl border border-dark-700 py-2 z-10">
                <button
                  onClick={handleDownload}
                  className="w-full text-left px-5 py-3 text-sm font-medium text-dark-200 hover:bg-dark-700 hover:text-white transition-colors"
                >
                  Download as Markdown
                </button>
              </div>
            )}
          </div>
          
          <button
            onClick={onStartOver}
            className="px-6 py-3 text-dark-300 border-2 border-dark-600 rounded-xl hover:bg-dark-700 hover:border-dark-500 transition-all font-bold"
          >
            Start Over
          </button>
        </div>
      </div>

      <div className="bg-dark-800 rounded-2xl overflow-hidden border border-dark-700">
        <div className="flex items-center justify-between px-6 py-3 bg-dark-900 border-b border-dark-700">
          <span className="text-sm text-dark-400 font-mono font-medium">project-spec.md</span>
          <button
            onClick={handleCopy}
            className="text-gray-300 hover:text-white transition-colors text-sm font-medium flex items-center gap-1.5"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" /> Copied
              </>
            ) : 'Copy'}
          </button>
        </div>
        
        <div className="p-6 md:p-8 overflow-x-auto max-h-[60vh] overflow-y-auto">
          <pre className="text-gray-100 text-sm md:text-base whitespace-pre-wrap font-mono leading-relaxed">
            {spec}
          </pre>
        </div>
      </div>

      <div className="bg-dark-800/50 border border-dark-700 rounded-2xl p-6 md:p-8">
        <h3 className="font-bold text-white mb-4 text-xl flex items-center gap-2">
          <Lightbulb className="w-6 h-6 text-yellow-400" /> What's Next?
        </h3>
        <ol className="text-dark-300 space-y-2 list-decimal list-inside text-base font-medium">
          <li>Copy the spec above</li>
          <li>Paste it into ChatGPT, Claude, or Cursor</li>
          <li>Say: "Help me build this following the spec exactly"</li>
          <li>Start coding with clear direction</li>
        </ol>
      </div>
    </div>
  );
}
