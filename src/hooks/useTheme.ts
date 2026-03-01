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
    // eslint-disable-next-line react-hooks/set-state-in-effect -- SSR-safe init: server renders null, client syncs after hydration
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
