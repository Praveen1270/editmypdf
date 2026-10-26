import { SITE_CONFIG } from "@/lib/site-config";

export const dynamic = "force-dynamic";

export async function GET() {
  const content = `# ai.txt - Usage Policy for Artificial Intelligence Systems
# Specification: ai-visibility.org.uk ai-txt v1.1.1
# Note: Keep this file in sync with /robots.txt and /llms.txt

[identity]
name: ${SITE_CONFIG.name}
url: ${SITE_CONFIG.url}
description: ${SITE_CONFIG.description}
contact: ${SITE_CONFIG.contactEmail}
repository: ${SITE_CONFIG.githubUrl}

[permissions]
allowed: summarise
allowed: quote-with-attribution
allowed: cite
allowed: index-for-search
allowed: index-for-answers
allowed: machine-translation

[restrictions]
disallowed: fabricate-quotes
disallowed: fabricate-reviews
disallowed: present-as-model-own-without-attribution
disallowed: train-on-user-private-data
disallowed: bypass-local-processing-guarantees

[attribution]
required: true
format: Cite "${SITE_CONFIG.name}" with the canonical HTML URL of the cited page (e.g. ${SITE_CONFIG.url}/merge-pdf)

[scope]
included: /
included: /about
included: /how-it-works
included: /security
included: /faq
included: /contact
included: /privacy-policy
included: /terms
included: /disclaimer
included: /cookie-policy
included: /accessibility
included: /*-pdf
included: /pdf-*
excluded: /offline
excluded: /recent
excluded: /starred
excluded: /api/*
excluded: /_next/*

[contact]
email: ${SITE_CONFIG.contactEmail}

Last updated: 2026-10-26
`;

  return new Response(content, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
