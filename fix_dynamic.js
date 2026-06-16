const fs = require('fs');
const path = require('path');
function walk(dir) {
  let results = [];
  fs.readdirSync(dir).forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      results = results.concat(walk(fullPath));
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      results.push(fullPath);
    }
  });
  return results;
}
walk('src/app').forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  if (content.includes('force-dynamic')) {
    content = content.replace(/export\s+const\s+dynamic\s*=\s*['"]force-dynamic['"];?/g, '');
    fs.writeFileSync(f, content.trim() + '\n');
    console.log('Fixed', f);
  }
});
console.log('Done');
