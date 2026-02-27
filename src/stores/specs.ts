import { create } from 'zustand';
import { nanoid } from 'nanoid';
import { Answer, SpecEntry } from '@/lib/types';
import { storageGet, storageSet } from '@/lib/storage';

interface SpecsState {
  specs: SpecEntry[];
  addSpec: (projectName: string, spec: string, answers: Answer[]) => SpecEntry;
  removeSpec: (id: string) => void;
  clearAll: () => void;
}

function loadSpecs(): SpecEntry[] {
  return storageGet<SpecEntry[]>('specs') ?? [];
}

function saveSpecs(specs: SpecEntry[]) {
  storageSet('specs', specs);
}

export const useSpecsStore = create<SpecsState>((set, get) => ({
  specs: loadSpecs(),

  addSpec: (projectName, spec, answers) => {
    const entry: SpecEntry = {
      id: nanoid(10),
      projectName,
      spec,
      answers,
      createdAt: new Date().toISOString(),
    };
    const specs = [entry, ...get().specs]; // newest first
    saveSpecs(specs);
    set({ specs });
    return entry;
  },

  removeSpec: (id) => {
    const specs = get().specs.filter((s) => s.id !== id);
    saveSpecs(specs);
    set({ specs });
  },

  clearAll: () => {
    saveSpecs([]);
    set({ specs: [] });
  },
}));
