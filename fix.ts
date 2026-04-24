import fs from 'fs';
let content = fs.readFileSync('server.ts', 'utf-8');
content = content.replace("✅\\`;", "✅`;");
fs.writeFileSync('server.ts', content);
console.log("Fixed syntax");
