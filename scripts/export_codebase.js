import fs from 'fs';
import path from 'path';

const projectDir = process.cwd();
const outputFile = path.join(projectDir, 'project_export.md');

const ignoreDirs = new Set(['.git', 'node_modules', 'dist', '.vercel', 'node-v20.11.0-darwin-arm64']);
const ignoreFiles = new Set(['database.sqlite', 'noc_technical_audit_system.tar.gz', 'node.tar.gz', 'project_export.md', '.DS_Store', 'database.json', 'package-lock.json', 'yarn.lock']);

const binaryExtensions = new Set(['png', 'jpg', 'jpeg', 'gif', 'pdf', 'zip', 'sqlite', 'tar', 'gz', 'ico']);

function getLanguage(filename) {
  const ext = path.extname(filename).slice(1).toLowerCase();
  const langMap = {
    ts: 'typescript',
    tsx: 'tsx',
    js: 'javascript',
    jsx: 'jsx',
    json: 'json',
    css: 'css',
    html: 'html',
    py: 'python',
    md: 'markdown',
    sh: 'bash',
    yaml: 'yaml',
    yml: 'yaml',
    env: 'env'
  };
  return langMap[ext] || '';
}

let outputContent = `# NOC PM Complete Project Source Export\n\n`;
outputContent += `> Generated on ${new Date().toISOString()}\n\n`;

function walkDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relPath = path.relative(projectDir, fullPath);

    if (entry.isDirectory()) {
      if (!ignoreDirs.has(entry.name)) {
        walkDir(fullPath);
      }
    } else if (entry.isFile()) {
      if (ignoreFiles.has(entry.name)) continue;

      const ext = path.extname(entry.name).slice(1).toLowerCase();
      if (binaryExtensions.has(ext)) continue;

      const lang = getLanguage(entry.name);
      try {
        const fileContent = fs.readFileSync(fullPath, 'utf8');
        outputContent += `## File: ${relPath}\n\n\`\`\`${lang}\n${fileContent}\n\`\`\`\n\n`;
      } catch (err) {
        outputContent += `## File: ${relPath}\n\n*Error reading file: ${err.message}*\n\n`;
      }
    }
  }
}

walkDir(projectDir);
fs.writeFileSync(outputFile, outputContent, 'utf8');

const stats = fs.statSync(outputFile);
console.log(`Successfully generated ${outputFile}`);
console.log(`Total File Size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
