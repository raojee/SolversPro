import fs from 'fs';
import path from 'path';

const categories = {
  math: 'EducationalApplication',
  finance: 'BusinessApplication',
  health: 'HealthApplication',
  trades: 'BusinessApplication'
};

const pagesDir = 'd:/SolverPro/src/pages';

for (const [cat, appCat] of Object.entries(categories)) {
  const catDir = path.join(pagesDir, cat);
  if (!fs.existsSync(catDir)) continue;
  
  const files = fs.readdirSync(catDir).filter(f => f.endsWith('.astro') && f !== 'index.astro');
  
  for (const file of files) {
    const filePath = path.join(catDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Find name
    const nameMatch = content.match(/"name":\s*"([^"]+)"/);
    if (!nameMatch) {
      console.log('No name found in', filePath);
      continue;
    }
    const toolName = nameMatch[1];
    
    // Construct new schema
    const newSchema = `const schema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "${toolName}",
  "applicationCategory": "${appCat}",
  "operatingSystem": "All",
  "browserRequirements": "Requires HTML5/JavaScript"
};`;

    // Replace old schema
    content = content.replace(/const schema = \{[\s\S]*?\};/, newSchema);
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated schema in ${cat}/${file}`);
  }
}
