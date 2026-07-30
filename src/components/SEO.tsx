import { useEffect } from 'react';
import { SITE_URL, SITE_NAME, DEFAULT_OG_IMAGE } from '../constants/site';
import { ORGANIZATION_SCHEMA } from '../lib/schema';

interface SEOProps {
  title: string;
  description: string;
  url?: string;
  ogImage?: string;
  schema?: any;
  faqSchema?: any;
  /** When true, emit <meta name="robots" content="noindex, follow"> (e.g. legal pages). */
  noindex?: boolean;
}

export const SEO: React.FC<SEOProps> = ({
  title,
  description,
  url = SITE_URL,
  ogImage = DEFAULT_OG_IMAGE,
  schema,
  faqSchema,
  noindex = false,
}) => {
  useEffect(() => {
    document.title = title;

    const setMeta = (name: string, content: string, isProperty = false) => {
      const selector = isProperty ? `meta[property="${name}"]` : `meta[name="${name}"]`;
      let el = document.querySelector(selector);
      if (!el) {
        el = document.createElement('meta');
        if (isProperty) el.setAttribute('property', name);
        else el.setAttribute('name', name);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    // Standard meta
    setMeta('description', description);

    // Robots — managed every render so a noindex flag from one route (e.g. /legal)
    // never leaks onto the next indexable route during client-side navigation.
    let robotsEl = document.querySelector('meta[name="robots"]');
    if (noindex) {
      if (!robotsEl) {
        robotsEl = document.createElement('meta');
        robotsEl.setAttribute('name', 'robots');
        document.head.appendChild(robotsEl);
      }
      robotsEl.setAttribute('content', 'noindex, follow');
    } else if (robotsEl) {
      robotsEl.remove();
    }

    // Open Graph
    setMeta('og:type', 'website', true);
    setMeta('og:site_name', SITE_NAME, true);
    setMeta('og:title', title, true);
    setMeta('og:description', description, true);
    setMeta('og:url', url, true);
    setMeta('og:image', ogImage, true);
    setMeta('og:image:width', '1200', true);
    setMeta('og:image:height', '630', true);

    // Twitter Card
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', title);
    setMeta('twitter:description', description);
    setMeta('twitter:image', ogImage);
    setMeta('twitter:url', url);

    // Canonical
    let canonicalEl = document.querySelector('link[rel="canonical"]');
    if (!canonicalEl) {
      canonicalEl = document.createElement('link');
      canonicalEl.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalEl);
    }
    canonicalEl.setAttribute('href', url);

    // Organization schema — site-wide, one per page. Reuses the prerendered
    // #schema-org node when present (crawler layer uses the same id) so there
    // is never a duplicate Organization node after hydration.
    let orgScriptEl = document.querySelector('script#schema-org');
    if (!orgScriptEl) {
      orgScriptEl = document.createElement('script');
      orgScriptEl.setAttribute('type', 'application/ld+json');
      orgScriptEl.id = 'schema-org';
      document.head.appendChild(orgScriptEl);
    }
    orgScriptEl.textContent = JSON.stringify(ORGANIZATION_SCHEMA);

    // Main App Schema (JSON-LD)
    let mainScriptEl = document.querySelector('script#schema-main');
    if (schema) {
      if (!mainScriptEl) {
        mainScriptEl = document.createElement('script');
        mainScriptEl.setAttribute('type', 'application/ld+json');
        mainScriptEl.id = 'schema-main';
        document.head.appendChild(mainScriptEl);
      }
      mainScriptEl.textContent = JSON.stringify(schema);
    } else if (mainScriptEl) {
      mainScriptEl.remove();
    }

    // FAQ Schema (JSON-LD)
    let faqScriptEl = document.querySelector('script#schema-faq');
    if (faqSchema) {
      if (!faqScriptEl) {
        faqScriptEl = document.createElement('script');
        faqScriptEl.setAttribute('type', 'application/ld+json');
        faqScriptEl.id = 'schema-faq';
        document.head.appendChild(faqScriptEl);
      }
      faqScriptEl.textContent = JSON.stringify(faqSchema);
    } else if (faqScriptEl) {
      faqScriptEl.remove();
    }

  }, [title, description, url, ogImage, schema, faqSchema, noindex]);

  return null;
};
