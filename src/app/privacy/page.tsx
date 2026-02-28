import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'How SpecifyThat handles your data. Short version: we don\'t store it.',
};

export default function PrivacyPage() {
  return (
    <main
      className="min-h-dvh px-6 py-24 max-w-3xl mx-auto"
      style={{ background: 'var(--color-bg)' }}
    >
      <h1
        className="text-3xl font-bold tracking-tight mb-8"
        style={{ color: 'var(--color-text)' }}
      >
        Privacy Policy
      </h1>

      <div
        className="space-y-6 text-sm leading-relaxed"
        style={{ color: 'var(--color-text-muted)' }}
      >
        <p>
          <strong style={{ color: 'var(--color-text)' }}>Last updated:</strong>{' '}
          {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </p>

        <Section heading="What we collect">
          <p>Almost nothing.</p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>
              <strong>Analytics:</strong> We use Google Analytics 4 (GA4) to measure pageviews and
              basic usage. This collects anonymized data like page URL, browser type, and country.
              No personal identifiers.
            </li>
            <li>
              <strong>Email (optional):</strong> If you subscribe to updates, we store your email
              address to send occasional product updates. You can unsubscribe anytime.
            </li>
            <li>
              <strong>Feedback (optional):</strong> If you submit feedback through the widget, we
              receive the message and your email (if provided).
            </li>
          </ul>
        </Section>

        <Section heading="What we don't collect">
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Your project descriptions or answers during the interview</li>
            <li>Your generated context files</li>
            <li>Your prompt content</li>
            <li>Any data from your codebase</li>
          </ul>
          <p>
            Your answers are sent to our server only to generate AI responses. The server
            validates rate limits, forwards the request to the AI provider, and returns the
            result. We never log, store, or inspect prompt content.
          </p>
        </Section>

        <Section heading="Where your data lives">
          <p>
            Your generated files and session data are stored in{' '}
            <code
              className="px-1.5 py-0.5 rounded text-xs font-mono"
              style={{ background: 'var(--color-surface)', color: 'var(--color-text)' }}
            >
              localStorage
            </code>{' '}
            in your browser. We never have access to it. If you clear your browser data or
            use &quot;Clear site data&quot;, your saved files are permanently deleted.
          </p>
        </Section>

        <Section heading="Rate limiting">
          <p>
            We use IP-based rate limiting to keep the service available for everyone. Your IP
            address is checked against limits but is not logged or stored beyond the request
            lifecycle.
          </p>
        </Section>

        <Section heading="Third parties">
          <ul className="list-disc pl-5 space-y-1.5">
            <li>
              <strong>OpenAI:</strong> Processes some AI generation requests. Subject to{' '}
              <a
                href="https://openai.com/policies/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
                style={{ color: 'var(--color-accent)' }}
              >
                OpenAI&apos;s privacy policy
              </a>.
            </li>
            <li>
              <strong>Groq:</strong> Processes some AI generation requests. Subject to{' '}
              <a
                href="https://groq.com/privacy-policy/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
                style={{ color: 'var(--color-accent)' }}
              >
                Groq&apos;s privacy policy
              </a>.
            </li>
            <li>
              <strong>Vercel:</strong> Hosts the application. Subject to{' '}
              <a
                href="https://vercel.com/legal/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
                style={{ color: 'var(--color-accent)' }}
              >
                Vercel&apos;s privacy policy
              </a>.
            </li>
            <li>
              <strong>Google Analytics:</strong> Collects anonymized usage data. Subject to{' '}
              <a
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
                style={{ color: 'var(--color-accent)' }}
              >
                Google&apos;s privacy policy
              </a>.
            </li>
          </ul>
        </Section>

        <Section heading="No accounts">
          <p>
            SpecifyThat does not require an account, login, or email to use. There are no
            cookies beyond what GA4 sets for analytics purposes.
          </p>
        </Section>

        <Section heading="Contact">
          <p>
            Questions about privacy? Reach out via the feedback widget in the app.
          </p>
        </Section>
      </div>
    </main>
  );
}

function Section({
  heading,
  children,
}: {
  heading: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h2 className="text-base font-semibold mb-2" style={{ color: 'var(--color-text)' }}>
        {heading}
      </h2>
      <div className="space-y-2">{children}</div>
    </div>
  );
}
