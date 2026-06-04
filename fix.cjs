const fs = require('fs');
const path = require('path');

const dirs = [
  'src/pages/finance',
  'src/pages/math',
  'src/pages/health',
  'src/pages/trades'
];

let files = [];
for (const dir of dirs) {
  const dirFiles = fs.readdirSync(dir).filter(f => f.endsWith('.astro')).map(f => path.join(dir, f));
  files.push(...dirFiles);
}

for (const file of files) {
  if (file.includes('index.astro')) continue;
  
  let content = fs.readFileSync(file, 'utf8');

  // Fix scientific-calculator container
  content = content.replace(/class="container max-w-2xl"/g, 'class="container max-w-2xl mx-auto"');

  // Fix title div
  content = content.replace(/<div class="mb-8">\s*<h1/g, '<div class="mb-8 max-w-3xl mx-auto text-center">\n        <h1');

  // Center form container if missing mx-auto
  content = content.replace(/class="([^"]*)form-container([^"]*)"/g, (match, p1, p2) => {
    if (!p1.includes('mx-auto') && !p2.includes('mx-auto')) {
      return `class="${p1}form-container mx-auto${p2}"`;
    }
    return match;
  });

  // Center results section if missing mx-auto
  content = content.replace(/id="results-section" class="([^"]*)"/g, (match, p1) => {
    if (!p1.includes('mx-auto')) {
      return `id="results-section" class="${p1} max-w-3xl mx-auto"`;
    }
    return match;
  });

  // Center formula section if missing mx-auto
  content = content.replace(/id="formula-section" class="([^"]*)"/g, (match, p1) => {
    if (!p1.includes('mx-auto')) {
      return `id="formula-section" class="${p1} max-w-3xl mx-auto"`;
    }
    return match;
  });
  
  // Center FAQ and How It Works wrappers
  content = content.replace(/<div class="mb-12">\s*<h2/g, '<div class="mb-12 max-w-3xl mx-auto">\n        <h2');

  fs.writeFileSync(file, content);
  console.log('Fixed', file);
}
