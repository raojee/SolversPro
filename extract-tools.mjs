import fs from 'fs/promises';
import path from 'path';

async function main() {
  const pagesDir = './src/pages';
  const dirs = await fs.readdir(pagesDir, { withFileTypes: true });
  
  const categories = dirs.filter(d => d.isDirectory() && d.name !== 'blog' && d.name !== 'dashboard').map(d => d.name);
  
  let toolsData = `export interface Tool {\n  title: string;\n  description: string;\n  icon: string;\n  href: string;\n}\n\n`;
  toolsData += `export const toolsByCategory: Record<string, Tool[]> = {\n`;

  for (const cat of categories) {
    const indexPath = path.join(pagesDir, cat, 'index.astro');
    try {
      const content = await fs.readFile(indexPath, 'utf-8');
      const match = content.match(/const\s+tools\s*=\s*(\[[\s\S]*?\]);/);
      if (match) {
        toolsData += `  "${cat}": ${match[1]},\n`;
      }
    } catch (e) {
      // Ignore if no index.astro
    }
  }
  
  toolsData += `};\n\n`;
  toolsData += `export const allTools = Object.values(toolsByCategory).flat();\n`;
  
  await fs.mkdir('./src/data', { recursive: true });
  await fs.writeFile('./src/data/tools.ts', toolsData, 'utf-8');
  console.log("Extracted tools to src/data/tools.ts");
}

main();
