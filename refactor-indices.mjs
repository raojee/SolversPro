import fs from 'fs/promises';
import path from 'path';

async function main() {
  const pagesDir = './src/pages';
  const dirs = await fs.readdir(pagesDir, { withFileTypes: true });
  const categories = dirs.filter(d => d.isDirectory() && !['blog', 'dashboard', 'api'].includes(d.name)).map(d => d.name);

  for (const cat of categories) {
    const indexPath = path.join(pagesDir, cat, 'index.astro');
    try {
      let content = await fs.readFile(indexPath, 'utf-8');
      
      // Check if it has a tools array
      if (content.includes('const tools = [')) {
        // Replace the tools array definition with an import
        content = content.replace(/const\s+tools\s*=\s*\[[\s\S]*?\];/, `import { toolsByCategory } from '../../data/tools';\nconst tools = toolsByCategory['${cat}'] || [];`);
        await fs.writeFile(indexPath, content, 'utf-8');
        console.log(`Refactored ${cat}/index.astro`);
      }
    } catch (e) {
      // file might not exist
    }
  }
}

main();
