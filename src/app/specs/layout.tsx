import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My context files',
  description:
    'All your saved AI context files. Download, search, or re-use them any time.',
};

export default function SpecsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
