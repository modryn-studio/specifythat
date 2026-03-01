import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Build your context file',
  description:
    'Describe your idea, answer a few questions, and get a context file your AI coding tool can actually use — in under 60 seconds.',
};

export default function InterviewLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
