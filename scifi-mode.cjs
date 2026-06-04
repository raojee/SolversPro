const fs = require('fs');
const path = require('path');

// All page files to update for sci-fi theme
const pageDirs = [
  'src/pages',
  'src/pages/finance',
  'src/pages/math',
  'src/pages/health',
  'src/pages/trades',
  'src/pages/tools',
  'src/pages/blog',
];

const reactDir = 'src/components/react';

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

const reactFullDir = path.join('D:\\SolverPro', reactDir);
if (fs.existsSync(reactFullDir)) {
  fs.readdirSync(reactFullDir).forEach(f => {
    if (f.endsWith('.jsx') || f.endsWith('.tsx')) {
      files.push(path.join(reactFullDir, f));
    }
  });
}

// Ensure index.astro is skipped since we just manually rewrote it completely
const filesToProcess = files.filter(f => !f.endsWith('index.astro') || f.includes('finance') || f.includes('health') || f.includes('math') || f.includes('trades'));

// Sci-Fi Replacements
const replacements = [
  // Typography overrides for headers
  ['class="text-4xl font-bold mb-6 text-white"', 'class="text-4xl font-bold mb-6 text-white" style="font-family: \'JetBrains Mono\', monospace;"'],
  ['class="text-3xl font-bold mb-4 text-white"', 'class="text-3xl font-bold mb-4 text-white" style="font-family: \'JetBrains Mono\', monospace;"'],
  ['class="text-2xl font-bold mb-4 text-white"', 'class="text-2xl font-bold mb-4 text-white" style="font-family: \'JetBrains Mono\', monospace;"'],
  ['class="text-xl font-bold mb-4 text-white"', 'class="text-xl font-bold mb-4 text-white" style="font-family: \'JetBrains Mono\', monospace;"'],
  ['class="text-xl font-semibold mb-4 text-white"', 'class="text-xl font-semibold mb-4 text-white" style="font-family: \'JetBrains Mono\', monospace;"'],

  // Background and borders for cards
  ['bg-[#162032] border border-slate-700', 'bg-white/[0.02] border border-white/[0.06]'],
  ['bg-[#162032]', 'bg-white/[0.02]'],
  ['bg-[#0f172a]', 'bg-[#0d0d14]'],
  ['bg-slate-800', 'bg-white/[0.03]'],
  ['bg-slate-900', 'bg-[#0d0d14]'],
  
  // Border colors
  ['border-slate-700', 'border-white/[0.06]'],
  ['border-slate-600', 'border-white/[0.1]'],

  // Text colors
  ['text-slate-300', 'text-zinc-400'],
  ['text-slate-400', 'text-zinc-500'],
  ['text-slate-500', 'text-zinc-600'],

  // Cyan to Teal / Orange conversion
  ['text-cyan-400', 'text-[#2dd4bf]'],
  ['bg-cyan-500', 'bg-[#ff6b35]'], // main buttons turn orange
  ['hover:bg-cyan-400', 'hover:bg-[#ff8c5a]'],
  ['hover:text-cyan-400', 'hover:text-[#2dd4bf]'],
  ['border-cyan-500', 'border-[#ff6b35]'],
  ['focus:border-cyan-500', 'focus:border-[#ff6b35]'],
  ['focus:ring-cyan-500/20', 'focus:ring-[#ff6b35]/20'],
  ['focus:ring-cyan-500', 'focus:ring-[#ff6b35]'],
  
  ['bg-cyan-500/10', 'bg-[#2dd4bf]/10'],
  ['bg-cyan-500/15', 'bg-[#2dd4bf]/15'],
];

let totalChanges = 0;

filesToProcess.forEach(filePath => {
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
  }
});

console.log(`\n🚀 Sci-Fi mode applied: ${totalChanges} total replacements.`);
