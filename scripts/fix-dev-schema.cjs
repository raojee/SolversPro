const fs = require('fs');
const path = require('path');

const devDir = path.join(__dirname, 'src', 'pages', 'developer');
const files = fs.readdirSync(devDir)
  .filter(f => f.endsWith('.astro'))
  .map(f => path.join(devDir, f));

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let newContent = content.replace(/\s*"offers"\s*:\s*\{[^}]+\}\s*,?/g, '');
  newContent = newContent.replace(/\s*"aggregateRating"\s*:\s*\{[^}]+\}\s*,?/g, '');
  
  // Also fix hanging commas in schema object if any
  newContent = newContent.replace(/,\s*\n\s*\}/g, '\n}');

  if (content !== newContent) {
    fs.writeFileSync(file, newContent, 'utf8');
    console.log(`Updated ${file}`);
  }
});
