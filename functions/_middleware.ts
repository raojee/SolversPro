/**
 * Cloudflare Pages Middleware for AI Agent Markdown Negotiation
 * RFC / Cloudflare Spec: https://developers.cloudflare.com/fundamentals/reference/markdown-for-agents/
 */

function simpleHtmlToMarkdown(html: string, url: string): string {
  // Remove scripts, styles, noscript, and svgs
  let clean = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<noscript\b[^<]*(?:(?!<\/noscript>)<[^<]*)*<\/noscript>/gi, '')
    .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, '');

  // Extract title and description
  const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : 'SolversPro';

  const descMatch = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i);
  const description = descMatch ? descMatch[1].trim() : '';

  // Extract main or body content if possible
  const mainMatch = clean.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i);
  let bodyContent = mainMatch ? mainMatch[1] : (clean.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i)?.[1] || clean);

  // Convert headings
  bodyContent = bodyContent.replace(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi, '\n\n# $1\n\n');
  bodyContent = bodyContent.replace(/<h2\b[^>]*>([\s\S]*?)<\/h2>/gi, '\n\n## $1\n\n');
  bodyContent = bodyContent.replace(/<h3\b[^>]*>([\s\S]*?)<\/h3>/gi, '\n\n### $1\n\n');
  bodyContent = bodyContent.replace(/<h4\b[^>]*>([\s\S]*?)<\/h4>/gi, '\n\n#### $1\n\n');
  bodyContent = bodyContent.replace(/<h5\b[^>]*>([\s\S]*?)<\/h5>/gi, '\n\n##### $1\n\n');
  bodyContent = bodyContent.replace(/<h6\b[^>]*>([\s\S]*?)<\/h6>/gi, '\n\n###### $1\n\n');

  // Convert paragraphs and line breaks
  bodyContent = bodyContent.replace(/<p\b[^>]*>([\s\S]*?)<\/p>/gi, '\n\n$1\n\n');
  bodyContent = bodyContent.replace(/<br\s*\/?>/gi, '\n');

  // Convert unordered and ordered lists
  bodyContent = bodyContent.replace(/<li\b[^>]*>([\s\S]*?)<\/li>/gi, '\n- $1');
  bodyContent = bodyContent.replace(/<\/?(ul|ol)\b[^>]*>/gi, '\n');

  // Convert links [text](href)
  bodyContent = bodyContent.replace(/<a\b[^>]*href=["']([^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi, '[$2]($1)');

  // Convert code blocks and inline code
  bodyContent = bodyContent.replace(/<pre\b[^>]*><code\b[^>]*>([\s\S]*?)<\/code><\/pre>/gi, '\n```\n$1\n```\n');
  bodyContent = bodyContent.replace(/<code\b[^>]*>([\s\S]*?)<\/code>/gi, '`$1`');

  // Remove any remaining HTML tags
  bodyContent = bodyContent.replace(/<[^>]+>/g, '');

  // Decode common HTML entities
  bodyContent = bodyContent
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');

  // Collapse multiple empty lines
  bodyContent = bodyContent.replace(/\n{3,}/g, '\n\n').trim();

  let header = `# ${title}\n\n`;
  if (description) {
    header += `> ${description}\n\n`;
  }
  header += `Source: ${url}\n\n---\n\n`;

  return header + bodyContent;
}

export async function onRequest(context: any) {
  const request = context.request;
  const acceptHeader = request.headers.get('accept') || '';

  // Continue to the next handler
  const response = await context.next();

  // If agent requested markdown and the response is HTML
  if (acceptHeader.includes('text/markdown')) {
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('text/html')) {
      try {
        const html = await response.text();
        const markdown = simpleHtmlToMarkdown(html, request.url);
        const tokens = Math.ceil(markdown.length / 4);

        const newHeaders = new Headers(response.headers);
        newHeaders.set('Content-Type', 'text/markdown; charset=utf-8');
        newHeaders.set('x-markdown-tokens', String(tokens));
        newHeaders.set('Vary', 'Accept');
        newHeaders.set('Access-Control-Allow-Origin', '*');

        return new Response(markdown, {
          status: response.status,
          statusText: response.statusText,
          headers: newHeaders,
        });
      } catch (err) {
        return response;
      }
    }
  }

  return response;
}
