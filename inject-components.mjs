import fs from 'fs/promises';
import path from 'path';

async function main() {
  const pagesDir = './src/pages';
  const dirs = await fs.readdir(pagesDir, { withFileTypes: true });
  
  const categories = dirs.filter(d => d.isDirectory() && !['blog', 'dashboard', 'api'].includes(d.name)).map(d => d.name);
  
  let modifiedCount = 0;

  for (const cat of categories) {
    const catPath = path.join(pagesDir, cat);
    const files = await fs.readdir(catPath);
    
    for (const file of files) {
      if (!file.endsWith('.astro') || file === 'index.astro') continue;
      
      const filePath = path.join(catPath, file);
      const slug = file.replace('.astro', '');
      let content = await fs.readFile(filePath, 'utf-8');
      
      if (content.includes('ToolShare')) {
        continue;
      }
      
      // Inject imports
      const importInject = `import ToolShare from '../../components/ToolShare.astro';\nimport SimilarTools from '../../components/SimilarTools.astro';\n`;
      content = content.replace(/(import BaseLayout .*?\n)/, `$1${importInject}`);
      
      // Extract title
      const titleMatch = content.match(/title="([^"]+)"/);
      let title = "SolversPro Tool";
      if (titleMatch) {
        title = titleMatch[1].replace(' | SolversPro', '');
      }
      
      // Inject components before </div>\n</main>
      const componentsInject = `\n      <ToolShare title="${title}" url="https://solverspro.com/${cat}/${slug}" />\n      <SimilarTools category="${cat}" currentPath="/${cat}/${slug}" />\n    `;
      content = content.replace(/(\s*)<\/div>\s*<\/main>/, `${componentsInject}$1</div>\n  </main>`);
      
      await fs.writeFile(filePath, content, 'utf-8');
      modifiedCount++;
      console.log(`Updated ${cat}/${file}`);
    }
  }
  
  console.log(`Done! Modified ${modifiedCount} files.`);
}

main();
