import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pagesDir = path.join(__dirname, 'src', 'pages');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      if (file.endsWith('.astro')) results.push(file);
    }
  });
  return results;
}

const files = walk(pagesDir);
let modifiedCount = 0;

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  
  if (content.includes('navigator.clipboard.writeText')) {
    // Determine relative path to src/utils/clipboard
    const depth = file.split(path.sep).length - pagesDir.split(path.sep).length;
    const relativePrefix = depth === 1 ? '../utils/clipboard' : '../../utils/clipboard';

    // Check if the script tag has the import already
    if (!content.includes('import { copyToClipboard }')) {
      content = content.replace(/<script>/g, `<script>\n  import { copyToClipboard } from '${relativePrefix}';`);
    }

    // Replace the clipboard call
    content = content.replace(/navigator\.clipboard\.writeText\((.*?)\)/g, 'copyToClipboard($1)');
    
    fs.writeFileSync(file, content);
    console.log(`Updated: ${file}`);
    modifiedCount++;
  }
}

console.log(`\nModified ${modifiedCount} files.`);
