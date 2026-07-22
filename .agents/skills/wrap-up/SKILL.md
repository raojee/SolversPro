---
name: wrap-up
description: Daily work analysis and wrap-up generator. Triggers when the user types "wrap up", "end of day", "daily log", or asks for a daily progress summary.
---

# Wrap-Up & Daily Progress Logger Skill

This skill automates the end-of-day summary process for SolversPro. When the user requests a "wrap up", this skill analyzes all work performed during the day, generates a structured daily log file, commits the changes to Git, and presents a summary.

## Workflow

### 1. Analyze Today's Progress & Git History
- Execute `git log --since="1 day ago" --stat` to retrieve all commits, file modifications, and author activity from today.
- Review created/updated pages, components, blog posts, performance fixes, accessibility improvements, and sitemaps.

### 2. Generate Daily Work Log Document
- Create a markdown file at `docs/daily-logs/YYYY-MM-DD.md` (e.g., `docs/daily-logs/2026-07-22.md`).
- Structure the document with the following sections:
  - **Header**: Date, Total Commits, Core Achievements Summary.
  - **🚀 Features & Tools**: New tools, updated components, and route additions.
  - **⚡ Performance & CWV Optimizations**: CLS reductions, LCP image preloads, bundle code-splitting.
  - **♿ Accessibility & UX**: WCAG AA contrast adjustments, ARIA roles, form labels, heading hierarchy (`H1 -> H2 -> H3`).
  - **📝 Content & SEO**: New blog posts, sitemap configurations, Schema.org additions.
  - **🛠️ Git Commits Log**: Table listing commit hashes, messages, and files touched.

### 3. Verify & Push to Repository
- Run `npx astro build` if code changes were made to verify build stability.
- Commit the daily log file and any remaining changes to Git (`git add -A ; git commit -m "docs: add daily work log for YYYY-MM-DD" ; git push`).

### 4. Provide Executive Summary to User
- Present a concise, structured markdown summary in the chat response.
- Provide a clickable file link to `docs/daily-logs/YYYY-MM-DD.md`.
