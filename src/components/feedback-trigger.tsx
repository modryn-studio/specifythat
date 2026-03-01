'use client';

// Mobile-only: dispatches the open-feedback event that FeedbackWidget listens for.
// Rendered inside the footer, hidden on md+ where the side tab takes over.
export function FeedbackTrigger() {
  return (
    <button
      onClick={() => window.dispatchEvent(new CustomEvent('open-feedback'))}
      className="cursor-pointer text-xs transition-colors md:hidden"
      style={{ color: 'var(--color-text-muted)', background: 'none', border: 'none' }}
    >
      Feedback
    </button>
  );
}
