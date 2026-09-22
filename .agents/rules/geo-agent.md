---
trigger: always_on
---

# GEO Audit Rule — SolversPro Tools

## Trigger
When the user says "GEO audit &lt;tool name&gt;" or "GEO audit &lt;url&gt;", execute the full 
GEO audit below for that tool and implement all gaps automatically.

## Procedure
1. Locate the tool's directory and index.html in this workspace. If the user gave 
   only a name, search for it; if ambiguous, ask before proceeding.
2. Audit against the Required Standard below.
3. Implement every ❌ gap (don't just report it — fix it, build, and commit).
4. Report in the format at the bottom.

## Required Standard (all 10 items)
1. **WebApplication JSON-LD**: name, url, applicationCategory 
   (UtilitiesApplication or DeveloperToolsApplication), operatingSystem 
   "Any (web browser)", one-sentence front-loaded description with differentiator, 
   provider Organization "SolversPro", offers free (price "0").
2. **FAQPage JSON-LD**: ONLY if visible FAQs exist — must mirror exact visible 
   text verbatim. Never invent FAQs.
3. **Meta tags**: meta description ~155 chars with primary keyword first, 
   canonical, og:type/url/title/description, og:image https://solverspro.com/og-image.png, 
   twitter:card summary_large_image.
4. **Direct-answer paragraph**: first element after H1 — one self-contained 
   quotable sentence: what the tool is, what it does, that it's free.
5. **Citable content**: at least one concrete table/spec list/comparison with 
   clear headers.
6. **llms.txt** at tool subdomain root: H1, one-line description, Key Facts, 
   Pages section linking related tools.
7. **ai-catalog.json entry**: in solverspro.com/.well-known/ai-catalog.json 
   tools array — name, description, url, category, capabilities[], cost "free".
8. **Link headers**: _headers file with rel="service-desc" → ai-catalog.json 
   and rel="describedby" → llms.txt.
9. **sitemap.xml** includes the URL with current lastmod.
10. **Cannibalization scan**: check all sibling subdomains + solverspro.com 
   routes for pages targeting the same primary keyword. If found, LIST them 
   in the report — do not change without explicit approval.

## Report Format
- Table: 10 items with ✅ present / ❌ implemented / ⚠️ issue
- Keyword conflicts found (if any)
- Files changed + live curl verification of every endpoint (must return 200)

## Hard Constraints
- Never modify tool logic, measurement code, or visual design
- FAQPage text must match visible content character-for-character
- &lt;head&gt; additions &lt; 5KB per page
- All schema must parse (validate before committing)
- Always end with: build → verify → commit to main