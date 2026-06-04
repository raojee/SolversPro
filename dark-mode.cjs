const fs = require('fs');
const path = require('path');

// All page files to update
const pageDirs = [
  'src/pages',
  'src/pages/finance',
  'src/pages/math',
  'src/pages/health',
  'src/pages/trades',
  'src/pages/tools',
  'src/pages/blog',
];

// Also update the React components
const reactDir = 'src/components/react';

// Collect all .astro and .jsx files
const files = [];
pageDirs.forEach(dir => {
  const fullDir = path.join('D:\\SolverPro', dir);
  if (fs.existsSync(fullDir)) {
    fs.readdirSync(fullDir).forEach(f => {
      if (f.endsWith('.astro')) {
        files.push(path.join(fullDir, f));
      }
    });
  }
});

// Add React components
const reactFullDir = path.join('D:\\SolverPro', reactDir);
if (fs.existsSync(reactFullDir)) {
  fs.readdirSync(reactFullDir).forEach(f => {
    if (f.endsWith('.jsx') || f.endsWith('.tsx')) {
      files.push(path.join(reactFullDir, f));
    }
  });
}

// Replacement map — order matters (longer/more specific strings first)
const replacements = [
  // === BACKGROUND COLORS ===
  // Form containers & cards
  ['bg-white border border-gray-200', 'bg-[#162032] border border-slate-700'],
  ['bg-white border border-[#d1d5db]', 'bg-[#162032] border border-slate-700'],
  ['bg-white border', 'bg-[#162032] border'],
  ['bg-[#ffffff]', 'bg-slate-900'],
  ['bg-white', 'bg-[#162032]'],
  ['bg-gray-50', 'bg-[#0f172a]'],
  ['bg-gray-100', 'bg-slate-800'],
  ['bg-[#f8f9fa]', 'bg-[#0f172a]'],
  
  // === TEXT COLORS ===
  // Headings — dark ink to white
  ['text-[#111827]', 'text-white'],
  // Body text — gray to slate-300
  ['text-[#374151]', 'text-slate-300'],
  // Muted text
  ['text-[#6b7280]', 'text-slate-400'],
  ['text-gray-500', 'text-slate-400'],
  ['text-gray-700', 'text-slate-300'],
  ['text-gray-400', 'text-slate-500'],
  
  // === BORDER COLORS ===
  ['border-gray-200', 'border-slate-700'],
  ['border-gray-300', 'border-slate-600'],
  ['border-[#d1d5db]', 'border-slate-600'],
  ['border-[#e5e7eb]', 'border-slate-700'],
  
  // === ACCENT COLORS (blue → cyan) ===
  ['text-[#2563eb]', 'text-cyan-400'],
  ['bg-[#2563eb]', 'bg-cyan-500'],
  ['hover:bg-[#1d4ed8]', 'hover:bg-cyan-400'],
  ['hover:text-blue-600', 'hover:text-cyan-400'],
  ['hover:border-[#2563eb]', 'hover:border-cyan-500'],
  ['border-[#2563eb]', 'border-cyan-500'],
  ['focus:border-[#2563eb]', 'focus:border-cyan-500'],
  ['focus:ring-[#2563eb]/20', 'focus:ring-cyan-500/20'],
  ['focus:ring-[#2563eb]', 'focus:ring-cyan-500'],
  
  // Badge colors
  ['bg-[#dbeafe]', 'bg-cyan-500/15'],
  ['text-[#1e40af]', 'text-cyan-400'],
  ['bg-[#eff6ff]', 'bg-cyan-500/10'],
  
  // Placeholder/muted
  ['text-[#9ca3af]', 'text-slate-500'],
  ['placeholder-gray-400', 'placeholder-slate-500'],
  
  // Search result highlight
  ['bg-[#eff6ff]', 'bg-cyan-500/10'],
  ['hover:bg-[#eff6ff]', 'hover:bg-cyan-500/10'],
  
  // Result summary section colors for specific results
  ['font-bold text-[#2563eb]', 'font-bold text-cyan-400'],
  
  // Hero search button specific
  ['bg-white/95', 'bg-[#1a1a2e]/95'],
];

let totalChanges = 0;

files.forEach(filePath => {
  let content = fs.readFileSync(filePath, 'utf-8');
  let fileChanges = 0;
  
  replacements.forEach(([from, to]) => {
    const count = content.split(from).length - 1;
    if (count > 0) {
      content = content.split(from).join(to);
      fileChanges += count;
    }
  });
  
  if (fileChanges > 0) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`✅ ${path.relative('D:\\SolverPro', filePath)} — ${fileChanges} replacements`);
    totalChanges += fileChanges;
  } else {
    console.log(`⏭️  ${path.relative('D:\\SolverPro', filePath)} — no changes needed`);
  }
});

console.log(`\n🎨 Dark mode applied: ${totalChanges} total replacements across ${files.length} files.`);
