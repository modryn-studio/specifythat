'use client';

// Mobile-only: dispatches the open-feedback event that FeedbackWidget listens for.
// Rendered inside the footer, hidden on md+ where the side tab takes over.
export function FeedbackTrigger() {
  return (
    <button
      onClick={() => window.dispatchEvent(new CustomEvent('open-feedback'))}
      className="cursor-pointer font-mono text-xs text-(--color-accent) transition-opacity hover:opacity-80 md:hidden"
    >
      Feedback
    </button>
  );
}
