# SEO Backlog — EditMyPDF

Ordered by expected high-intent users / conversions per hour of work.

---

## High Priority (Immediate Sprint)

### 1. Optimize Tool Page Titles & Meta in `lib/seo.ts`
- **Query**: `[Primary Tool Keyword] + [Benefit]` (e.g. `Edit PDF Online - Edit Text & Sign Free`)
- **Page**: All 22 tool routes via `lib/seo.ts`
- **Change**: Align with `seo-title-optimization` rule: ensure primary keyword is at the front, keep length between 40-52 chars before ` | EditMyPDF` template appends, avoid SERP truncation, and ensure 100% exact H1 & description topic alignment. Add dedicated mapping for `edit-pdf-text`.
- **Expected Impact**: High (Immediate CTR lift across Google and Bing SERPs).

### 2. Flagship Money Page Push for `/edit-pdf-text` and `/edit-pdf`
- **Query**: `edit pdf text online`, `edit existing text in pdf free`
- **Page**: `/edit-pdf-text`, `/edit-pdf`
- **Change**: Execute Blitz SEO sprint checklist. Ensure FAQ schema answers "How to edit existing text without converting to Word", "Is this completely private without uploading?", and highlight font matching capabilities (Arimo, Tinos, Cousine, Carlito, Caladea, Noto).
- **Expected Impact**: High (Top money keyword in the PDF utility category).

### 3. Add Competitor Alternative Comparison Content
- **Query**: `smallpdf alternative free no limit`, `ilovepdf alternative privacy`, `sejda alternative`
- **Page**: `/alternatives` (or dedicated comparison sections on homepage/FAQ)
- **Change**: Publish objective feature & privacy comparison matrix highlighting 100% client-side zero-upload vs cloud server upload models.
- **Expected Impact**: Medium-High (Direct bottom-of-funnel conversion for dissatisfied competitor users hitting daily paywalls).

---

## Medium Priority

### 4. Enhance Rich Structured Data (JSON-LD) for SoftwareApplication
- **Query**: All tool keywords
- **Page**: `components/seo/JsonLd.tsx`
- **Change**: Add `operatingSystem`, `applicationCategory: "UtilitiesApplication"`, `offers: { price: "0", priceCurrency: "USD" }`, and `aggregateRating` / `browserRequirements` tags to reinforce eligibility for rich snippets and AI answer citation.
- **Expected Impact**: Medium (Improved CTR through rich snippet star/free utility badges).

### 5. Expand How-To Step Content with Rich Screenshots/Diagrams
- **Query**: `how to merge pdf without upload`, `how to edit pdf text without adobe`
- **Page**: Individual tool landing pages
- **Change**: Ensure each tool page includes 3 structured step cards with clear semantic microcopy and schema-backed HowTo steps.
- **Expected Impact**: Medium (Captures "how-to" instructional snippet positions on Google).

---

## Lower Priority / Standing

### 6. Directory Submissions
- **Query**: Brand queries & discovery
- **Action**: Submit EditMyPDF to AlternativeTo, SaaSHub, Toolify, Product Hunt, and PrivacyGuides forums.
- **Expected Impact**: Moderate initial domain rating (DR) boost and foundational organic backlink profile.
