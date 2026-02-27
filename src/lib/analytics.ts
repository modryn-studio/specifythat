// analytics.ts — GA4 event tracking abstraction
// Never call gtag() directly outside this file.
// Add a named method for each distinct user action — keeps events typed
// and discoverable instead of magic strings scattered across the codebase.

declare global {
  interface Window {
    gtag: (command: string, ...args: unknown[]) => void;
  }
}

type EventProps = Record<string, string | number | boolean | undefined>;

function track(eventName: string, props?: EventProps): void {
  // SSR guard — gtag is browser-only
  if (typeof window === 'undefined') return;
  if (typeof window.gtag !== 'function') return;
  window.gtag('event', eventName, props);
}

// Add project-specific named methods below.
// Pattern: namedAction: (props: { ... }) => track('event_name', props)
export const analytics = {
  track,
  newsletterSignup: () => track('newsletter_signup'),
  feedbackSubmit: () => track('feedback_submit'),
  // SpecifyThat-specific events
  interviewStarted: () => track('interview_started'),
  specGenerated: () => track('spec_generated'),
  specCopied: () => track('spec_copied'),
  specDownloaded: () => track('spec_downloaded'),
  // Demand signal — when >20% of daily users hit this, it's time to add billing
  rateLimitHit: (props: { route: string }) => track('rate_limit_hit', props),
};
