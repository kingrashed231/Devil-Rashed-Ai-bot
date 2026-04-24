import fs from 'fs';
let content = fs.readFileSync('server.ts', 'utf-8');
const i = content.indexOf(`const prevEdits = Object.entries(sentMessagesForNextPrediction);`);
console.log(content.substring(i, i+300));
