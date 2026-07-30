// Reusable JSON-LD (schema.org) builders — single source of truth for the
// runtime SEO layer. Pages pass the objects these return to <SEO schema=... />,
// which injects them as <script type="application/ld+json"> into <head>.
//
// The build-time crawler layer lives in ../../seo-data.mjs and mirrors these
// shapes; keep the two in sync when changing schema structure.
//
// Guideline notes (Google Search Central):
//  - No `sameAs` until real, verifiable social profiles exist (empty arrays are
//    a validation warning — omit the property entirely instead).
//  - No `aggregateRating` / `review` without real, on-page review data.
//  - All URLs are absolute against the canonical production origin.

import { SITE_URL, SITE_NAME } from '../constants/site';

/** Stable, production logo URL (square 2000x2000). Served from /public. */
export const ORGANIZATION_LOGO = `${SITE_URL}/logo.png`;

/**
 * Organization schema — injected site-wide (once per page). `sameAs` is
 * intentionally omitted until official social profiles are confirmed.
 */
export const ORGANIZATION_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: SITE_NAME,
  url: SITE_URL,
  logo: ORGANIZATION_LOGO,
  description:
    'AI-powered career platform helping job seekers beat ATS, ace interviews, and land their dream jobs faster.',
} as const;

/**
 * Platform pricing as an AggregateOffer: Free (₹0) through Pro Annual (₹999).
 * The free tier is live, so the range is accurate; paid tiers are launching.
 * Mirrors src/lib/pricing.ts — update both if prices change.
 */
export const PLATFORM_OFFERS = {
  '@type': 'AggregateOffer',
  priceCurrency: 'INR',
  lowPrice: '0',
  highPrice: '999',
  offerCount: '4',
  availability: 'https://schema.org/InStock',
} as const;

interface SoftwareApplicationInput {
  /** Unique, human-readable product name, e.g. "Talvorax Resume Analyzer". */
  name: string;
  /** Unique description of this specific tool (no shared boilerplate). */
  description: string;
  /** Absolute path for the tool's canonical URL, e.g. "/resume-analyzer". */
  path: string;
  /** Include the platform Offer block (default true). */
  offers?: boolean;
}

/** Build a SoftwareApplication schema for a product page. */
export function softwareApplicationSchema({
  name,
  description,
  path,
  offers = true,
}: SoftwareApplicationInput) {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    description,
    url: `${SITE_URL}${path}`,
  };
  if (offers) schema.offers = PLATFORM_OFFERS;
  return schema;
}

export interface FAQItem {
  q: string;
  a: string;
}

/**
 * Build a FAQPage schema from the SAME array that renders the visible FAQ, so
 * the structured data always matches on-page content (a Google requirement).
 */
export function faqPageSchema(faqs: FAQItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
}
