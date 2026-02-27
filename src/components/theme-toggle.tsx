'use client';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggle } = useTheme();

  // Avoid rendering until theme is resolved to prevent hydration mismatch
  if (!theme) return null;

  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      className={className}
      style={{
        color: 'var(--color-text-muted)',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '4px',
        borderRadius: '6px',
        opacity: 0.7,
        transition: 'opacity 0.2s',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
      onMouseLeave={e => (e.currentTarget.style.opacity = '0.7')}
    >
      {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}
