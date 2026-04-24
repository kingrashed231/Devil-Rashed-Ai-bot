import fs from 'fs';
let content = fs.readFileSync('server.ts', 'utf8');

const tTarget = `  // API routes FIRST
  app.get('/api/health', (req, res) => {`;

const tRepl = `  // API routes FIRST
  app.get('/api/super-keepalive', (req, res) => {
      // HOLD THE CONNECTION OPEN FOR 24 HOURS to force Cloud Run CPU to stay awake!
      req.setTimeout(24 * 60 * 60 * 1000);
      res.setTimeout(24 * 60 * 60 * 1000);
      // We don't res.send() here, we just hold the line open.
      setInterval(() => { res.write(' '); }, 30000); // 30s TCP keep-alive whitespace ping
  });

  app.get('/api/health', (req, res) => {`;

content = content.replace(tTarget, tRepl);

const tTarget2 = `setInterval(() => {
    axios.get('http://127.0.0.1:3000/api/health', { timeout: 2000 }).catch(()=>{});
}, 30000); // Trigger network to delay container sleep`;

const tRepl2 = `// Hold an internal connection open indefinitely to keep the CPU awake
function maintainKeepAlive() {
    axios.get('http://127.0.0.1:3000/api/super-keepalive', { responseType: 'stream' })
         .catch((err) => {
             setTimeout(maintainKeepAlive, 5000);
         });
}
setTimeout(maintainKeepAlive, 5000);`;

content = content.replace(tTarget2, tRepl2);

fs.writeFileSync('server.ts', content);
