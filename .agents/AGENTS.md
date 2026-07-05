# SolversPro Workspace Agent Rules

## Adding New Tools

Whenever you add new tools to the SolversPro project, you MUST update the following informational pages and configurations to reflect the new total tool count and provide documentation for the new tools:

1. **`src/data/tools.ts`**: Register the new tools in the central tool registry.
2. **`src/pages/docs.astro`**: Add full documentation blocks (description, features, steps) for each new tool.
3. **`src/pages/about.astro`**: Update the total number of tools (e.g., changing "70+" to the new count).
4. **`src/pages/all-tools.astro`**: Update the total number of tools and any summary text.
5. **`src/pages/terms.astro`**: Update the total number of tools and the list of categories/tools in the "Description of Service" section.
6. **`src/pages/privacy.astro`**: Update the total number of tools in the description metadata and anywhere else it is mentioned.
7. **Blog Posts (`src/pages/blog/`)**: 
   - Update promotional blog post titles and URLs (e.g., `70-free-online-tools...` -> `80-free-online-tools...`).
   - Update the internal text of these posts to match the new count.
   - Update `src/pages/blog/index.astro` to reflect the new blog post URL and title.
8. **Always verify the build**: After updating these files, always run `npx astro build` to ensure no components or syntax issues were introduced.
