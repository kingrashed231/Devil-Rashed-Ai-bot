import fs from 'fs';

let content = fs.readFileSync('server.ts', 'utf8');

const tSearch = `  // API routes FIRST
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: Date.now() });
  });`;

const tRepl = `  // API routes FIRST
  app.get('/api/health', (req, res) => {
    // 🔥 SMART IDEA FOR CRON JOB WAKE-UP:
    // Delay the response by 3 seconds so the container CPU remains "Allocated" and "Awake" 
    // long enough for Telegram sending, market polling, and ML inference async chains to complete!
    setTimeout(() => {
        res.json({ status: 'ok', timestamp: Date.now(), bot_active: true });
    }, 3000);
  });`;

content = content.replace(tSearch, tRepl);
fs.writeFileSync('server.ts', content);
console.log("Health patched");
