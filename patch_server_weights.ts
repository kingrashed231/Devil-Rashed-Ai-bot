import fs from 'fs';
let content = fs.readFileSync('server.ts', 'utf8');

const tSearch = `async function getDynamicWeights() {`;
const tRepl = `async function getEngineWeights() {
    try {
        if (!_quotaExceeded && WEIGHTS_DOC) {
            const snap = await getDoc(WEIGHTS_DOC);
            if (snap.exists() && snap.data().engineWeights) {
                return snap.data().engineWeights;
            }
        }
    } catch(e) {}
    return null;
}

async function getDynamicWeights() {`;

content = content.replace(tSearch, tRepl);

const bootSearch = `advancedEngine.analyze(shortHistory, mode);`;
const bootRepl = `advancedEngine.analyze(shortHistory, mode);`; // wait, better place for boot

const bootSearch2 = `// Fallback
  return _cachedAdminData || initialData;
}`;
const bootRepl2 = `// Fallback
  return _cachedAdminData || initialData;
}

// Ensure engine loads weights on start
setTimeout(async () => {
    const ew = await getEngineWeights();
    if (ew) advancedEngine.setWeights(ew);
}, 5000);
`;

content = content.replace(bootSearch2, bootRepl2);

const trainSearch = `// 1. Resolve previous prediction & Train AI
             if (nextPrediction && nextPrediction.issue === latestIssue.issueNumber) {`;

const trainRepl = `// 1. Resolve previous prediction & Train AI
             if (nextPrediction && nextPrediction.issue === latestIssue.issueNumber) {
                 // Train Engine with actual result
                 if (nextPrediction.models) {
                     advancedEngine.feedback(nextPrediction.models, latestIssue.size);
                     // Save memory forever
                     if (!_quotaExceeded && WEIGHTS_DOC) {
                         safeSetDoc(WEIGHTS_DOC, { engineWeights: advancedEngine.getWeights() }, { merge: true }).catch(()=>{});
                     }
                 }`;

content = content.replace(trainSearch, trainRepl);


fs.writeFileSync('server.ts', content);
