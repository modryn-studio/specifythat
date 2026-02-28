import { site } from '@/config/site';

// Renders the site-wide JSON-LD structured data in the root layout.
// Consumed by Google for rich results and knowledge panel eligibility.
export function SiteSchema() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify([
          {
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: site.name,
            url: site.url,
            description: site.description,
          },
          {
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: site.name,
            url: site.url,
            logo: `${site.url}/icon.png`,   // served by src/app/icon.png
            description: site.description,
            founder: {
              '@type': 'Person',
              name: site.founder,
            },
          },
        ]),
      }}
    />
  );
}
