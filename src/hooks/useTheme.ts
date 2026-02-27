'use client';
import { useEffect, useState } from 'react';

const KEY = 'specifythat:theme';

export function useTheme() {
  const [theme, setTheme] = useState<'light' | 'dark' | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(KEY) as 'light' | 'dark' | null;
    const system = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const resolved = saved ?? system;
    document.documentElement.dataset.theme = resolved;
    setTheme(resolved);
  }, []);

  function toggle() {
    const next = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    localStorage.setItem(KEY, next);
    setTheme(next);
  }

  return { theme, toggle };
}
