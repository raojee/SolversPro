import fs from 'node:fs';
import path from 'node:path';

function escapeXml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

const TOOL_CATEGORIES = [
  'developer',
  'pdf',
  'math',
  'text',
  'finance',
  'trades',
  'network',
  'health',
  'qr',
  'security',
];

export function generateImageSitemap(outDir = 'dist/client') {
  const rootDir = process.cwd();
  const pagesDir = path.join(rootDir, 'src', 'pages');
  const imagesDir = path.join(rootDir, 'public', 'images', 'tools');

  // Ensure images directory exists
  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
  }

  // 1. Scan tool pages and extract metadata
  const toolsMap = new Map();

  for (const category of TOOL_CATEGORIES) {
    const catDir = path.join(pagesDir, category);
    if (!fs.existsSync(catDir)) continue;

    const files = fs.readdirSync(catDir);
    for (const file of files) {
      if (!file.endsWith('.astro') || file === 'index.astro') continue;

      const slug = file.replace('.astro', '');
      const filePath = path.join(catDir, file);
      const content = fs.readFileSync(filePath, 'utf8');

      // Extract title from BaseLayout prop
      let title = slug.replace(/-/g, ' ');
      const titleMatch = content.match(/title=["']([^"']+)["']/);
      if (titleMatch) {
        title = titleMatch[1].split('|')[0].replace(/—.*$/, '').trim();
      }

      // Extract description from BaseLayout prop
      let description = '';
      const descMatch = content.match(/description=["']([^"']+)["']/);
      if (descMatch) {
        description = descMatch[1].trim();
        if (description.length > 200) {
          description = description.slice(0, 197) + '...';
        }
      }

      const url = `https://solverspro.com/${category}/${slug}/`;
      toolsMap.set(slug, { slug, category, title, description, url });
    }
  }

  // 2. Scan public/images/tools/ for matching screenshots
  const imageFiles = fs.readdirSync(imagesDir);
  const toolImagesMap = new Map(); // slug -> list of image filenames

  const validExts = new Set(['.png', '.jpg', '.jpeg', '.webp', '.svg']);

  for (const imgFile of imageFiles) {
    const ext = path.extname(imgFile).toLowerCase();
    if (!validExts.has(ext)) continue;

    const nameWithoutExt = path.basename(imgFile, ext);

    // Match exact slug or slug with suffix (e.g. json-to-python, json-to-python-1, json-to-python_2)
    for (const [slug] of toolsMap.entries()) {
      if (
        nameWithoutExt === slug ||
        nameWithoutExt.startsWith(`${slug}-`) ||
        nameWithoutExt.startsWith(`${slug}_`)
      ) {
        if (!toolImagesMap.has(slug)) {
          toolImagesMap.set(slug, []);
        }
        toolImagesMap.get(slug).push(imgFile);
        break;
      }
    }
  }

  // 3. Build XML entries
  let xmlEntries = '';
  let totalImagesCount = 0;

  for (const [slug, images] of toolImagesMap.entries()) {
    const tool = toolsMap.get(slug);
    if (!tool || images.length === 0) continue;

    // Sort images so main image comes first
    images.sort((a, b) => {
      const aExt = path.extname(a);
      const bExt = path.extname(b);
      const aBase = path.basename(a, aExt);
      const bBase = path.basename(b, bExt);
      if (aBase === slug) return -1;
      if (bBase === slug) return 1;
      return a.localeCompare(b);
    });

    let imageBlocks = '';
    for (const img of images) {
      totalImagesCount++;
      const imgUrl = `https://solverspro.com/images/tools/${img}`;
      imageBlocks += `    <image:image>\n`;
      imageBlocks += `      <image:loc>${escapeXml(imgUrl)}</image:loc>\n`;
      imageBlocks += `      <image:title>${escapeXml(tool.title)}</image:title>\n`;
      if (tool.description) {
        imageBlocks += `      <image:caption>${escapeXml(tool.description)}</image:caption>\n`;
      }
      imageBlocks += `    </image:image>\n`;
    }

    xmlEntries += `  <url>\n`;
    xmlEntries += `    <loc>${escapeXml(tool.url)}</loc>\n`;
    xmlEntries += imageBlocks;
    xmlEntries += `  </url>\n`;
  }

  const sitemapImagesXml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${xmlEntries}</urlset>\n`;

  // 4. Output sitemap-images.xml
  const targetDir = path.resolve(rootDir, outDir);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const imagesXmlPath = path.join(targetDir, 'sitemap-images.xml');
  fs.writeFileSync(imagesXmlPath, sitemapImagesXml, 'utf8');
  console.log(`[image-sitemap] Generated sitemap-images.xml at ${imagesXmlPath} (${toolImagesMap.size} URLs, ${totalImagesCount} images)`);

  // 5. Generate / update sitemap-index.xml and sitemap.xml
  const today = new Date().toISOString().split('T')[0] + 'T00:00:00.000Z';
  const indexXmlContent = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <sitemap>\n    <loc>https://solverspro.com/sitemap-0.xml</loc>\n    <lastmod>${today}</lastmod>\n  </sitemap>\n  <sitemap>\n    <loc>https://solverspro.com/sitemap-images.xml</loc>\n    <lastmod>${today}</lastmod>\n  </sitemap>\n</sitemapindex>\n`;

  fs.writeFileSync(path.join(targetDir, 'sitemap.xml'), indexXmlContent, 'utf8');
  fs.writeFileSync(path.join(targetDir, 'sitemap-index.xml'), indexXmlContent, 'utf8');
  console.log(`[image-sitemap] Updated sitemap.xml and sitemap-index.xml at ${targetDir}`);
}

// Allow CLI execution directly
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('generate-image-sitemap.mjs')) {
  generateImageSitemap();
}

// Export Astro Integration
export default function imageSitemapPlugin() {
  return {
    name: 'image-sitemap-generator',
    hooks: {
      'astro:build:done': async ({ dir }) => {
        const outDir = dir ? dir.pathname.replace(/^\/([A-Za-z]:)/, '$1') : 'dist/client';
        generateImageSitemap(outDir);
      },
    },
  };
}
