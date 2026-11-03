import fs from 'fs';
import path from 'path';

let errors = 0;
function checkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const f of files) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) checkDir(full);
    else if (full.endsWith('.jsx') || full.endsWith('.js')) {
      const content = fs.readFileSync(full, 'utf8');
      const matches = content.match(/from\s+['"](\.[^'"]+)['"]/g) || [];
      for (const m of matches) {
        const rel = m.replace(/from\s+['"]/, '').replace(/['"]$/, '');
        const target = path.resolve(path.dirname(full), rel);
        const candidates = [
          target,
          target + '.js',
          target + '.jsx',
          path.join(target, 'index.js'),
          path.join(target, 'index.jsx')
        ];
        if (!candidates.some(c => fs.existsSync(c))) {
          console.error(`BROKEN IMPORT in ${full}: ${rel}`);
          errors++;
        }
      }
    }
  }
}

checkDir('./client/src');
checkDir('./server/src');
console.log(`Import verification complete. Total errors: ${errors}`);
if (errors > 0) process.exit(1);
