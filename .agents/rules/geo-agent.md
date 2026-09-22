---
trigger: always_on
---

# GEO Audit Rule — SolversPro Tools

## Trigger
When the user says "GEO audit &lt;tool name&gt;", "GEO audit &lt;url&gt;", or 
"GEO audit all &lt;category&gt; tools", execute the full audit below for the 
targeted tool(s) and implement every gap automatically.

## Target Resolution
- Match the name to the tool's directory in this workspace. If ambiguous, ask 
  before proceeding.
- Determine deployment type from the URL:
  - **PATH tool** (e.g. solverspro.com/developer/json-tools/): main-domain 
    deployment, covered by centralized root files.
  - **SUBDOMAIN tool** (e.g. speed.solverspro.com): standalone deployment with 
    its own public/ stack.

## Standard A — Path Tools on solverspro.com (~79 tools)
DO NOT create per-tool llms.txt, sitemap.xml, or _headers files. Never create 
subfolder copies like /developer/llms.txt. Per-page requirements:
1. **WebApplication JSON-LD**: name, url, applicationCategory 
   ("UtilitiesApplication" or "DeveloperToolsApplication"), operatingSystem 
   "Any (web browser)", one-sentence front-loaded description with 
   differentiator, provider Organization "SolversPro", offers free (price "0").
2. **FAQPage JSON-LD**: ONLY if the page has a visible ToolFAQ accordion — 
   mirror exact visible text verbatim, 1:1. Never invent FAQs. If no FAQ 
   accordion exists, skip this item and note it in the report.
3. **Meta tags**: meta description ~155 chars with primary keyword first, 
   canonical, og:type/url/title/description, og:image 
   https://solverspro.com/og-image.png, twitter:card summary_large_image.
4. **Direct-answer paragraph**: first element after &lt;h1&gt; — one self-contained 
   quotable sentence: what the tool is, what it does, that it's free.
5. **Citable content**: at least one concrete table/spec list/comparison with 
   clear headers (benchmarks, formulas, unit tables, etc.).
Then verify (not create) the centralized root files include this tool:
6. **Root llms.txt**: listed under ## Pages & Tools with one-line description.
7. **Root ai-catalog.json**: entry in tools array with name, description, url, 
   category, capabilities[], cost "free".
8. **Root _headers**: Link headers with rel="service-desc" and 
   rel="describedby" present site-wide (verify once per audit, not per tool).
9. **sitemap**: URL present in root sitemap with current lastmod.
10. **Cannibalization scan**: check sibling routes + subdomains for pages 
    targeting the same primary keyword. LIST conflicts in the report — never 
    change other pages without explicit approval.

## Standard B — Subdomain Tools (e.g. speed.solverspro.com)
Full per-deployment stack, as done for speed.solverspro.com:
1–5. Same WebApplication/FAQPage schema, meta, direct-answer, citable content.
6. **Subdomain llms.txt** at deployment root: H1, blockquote summary, 
   Key Facts, Pages & Related Tools sections.
7. **Subdomain ai-catalog reference**: /.well-known/ai-catalog.json 301 
   redirects to https://solverspro.com/.well-known/ai-catalog.json (single hop, 
   no SPA fallback); tool entry lives in the ROOT catalog.
8. **Subdomain _headers**: rel="service-desc" → root ai-catalog.json, 
   rel="describedby" → subdomain llms.txt.
9. **Subdomain sitemap.xml** with priority 1.0 and current lastmod.
10. Same cannibalization scan.

## Gold-Standard References
- Completed path-tool example: use the best-reviewed page in this repo 
  (check network/ or finance/ pages first).
- Completed subdomain example: speed.solverspro.com (commit history in 
  d:\SolverPro\speed).

## Batch Mode
When the user says "GEO audit all &lt;category&gt; tools":
1. List every tool in that category from the sitemap/category page.
2. Run Standard A items 1–5 on each page sequentially.
3. Report per tool: ✅/❌/⚠️ table + files changed.
4. After the last tool: verify root llms.txt + ai-catalog.json include ALL 
   batch tools in one pass.
5. One commit per category (not per tool), message: 
   "GEO audit: &lt;category&gt; tools (N pages)".

## Report Format
- Per tool: 10-item table (✅ present / ❌ implemented / ⚠️ issue)
- Keyword conflicts found (if any)
- Files changed + curl verification of every new/changed endpoint

## Hard Constraints
- NEVER modify tool logic, measurement code, or visual design
- FAQPage text must match visible content character-for-character
- &lt;head&gt; additions &lt; 5KB per page
- All JSON-LD must parse cleanly before committing
- Always end with: build → live curl verification → commit to main