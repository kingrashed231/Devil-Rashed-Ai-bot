import fs from 'fs';

let content = fs.readFileSync('server.ts', 'utf8');

const tTarget = `let _quotaExceeded = false;`;
const tRepl = `let _quotaExceeded = false;

// Auto-recovery mechanism for Firebase Quota
setInterval(async () => {
    if (_quotaExceeded) {
        try {
            // Attempt a lightweight test read to check if quota is refreshed
            if (HISTORY_DOC) {
               await getDoc(HISTORY_DOC);
               _quotaExceeded = false;
               console.log("🔥 Firebase Quota Refreshed! Reconnected to main database and AI Brain sync restored.");
            }
        } catch(e: any) {
            // Still exceeded, do nothing
        }
    }
}, 60 * 60 * 1000); // Check every 1 hour
`;

content = content.replace(tTarget, tRepl);

// Also skip getDoc for AdminData, HistoryData, etc if _quotaExceeded is true to save network/log spam
const histTarget = `async function getHistoryData() {
  if (_cachedHistory && Date.now() - _historyLastFetch < 60000) return _cachedHistory;
  if (_quotaExceeded && _cachedHistory) return _cachedHistory; // ALWAYS use RAM if DB is frozen to preserve new learning`;

const histRepl = `async function getHistoryData() {
  if (_cachedHistory && Date.now() - _historyLastFetch < 60000) return _cachedHistory;
  if (_quotaExceeded && _cachedHistory) return _cachedHistory; // ALWAYS use RAM if DB is frozen to preserve new learning
  if (_quotaExceeded) return _cachedHistory || [];`;

content = content.replace(histTarget, histRepl);

const adminTarget = `  if (_cachedAdminData && Date.now() - _adminLastFetch < 10000) return _cachedAdminData;

  try {`;

const adminRepl = `  if (_cachedAdminData && Date.now() - _adminLastFetch < 10000) return _cachedAdminData;
  if (_quotaExceeded && _cachedAdminData) return _cachedAdminData;

  try {`;

content = content.replace(adminTarget, adminRepl);


fs.writeFileSync('server.ts', content);
console.log("Quota auto-recovery added.");
