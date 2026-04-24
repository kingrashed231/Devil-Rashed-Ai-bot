import fs from 'fs';

let content = fs.readFileSync('server.ts', 'utf8');

const tSearch = `                 // Train Engine with actual result
                 if (nextPrediction.models) {
                     advancedEngine.feedback(nextPrediction.models, latestIssue.size);
                     // Save memory forever
                     if (!_quotaExceeded && WEIGHTS_DOC) {
                         safeSetDoc(WEIGHTS_DOC, { engineWeights: advancedEngine.getWeights() }, { merge: true }).catch(()=>{});
                     }
                 }`;
                 
const tRepl = `                 // Train Engine with actual result
                 if (nextPrediction.models) {
                     const sizeHist = list.map((h: any) => h.number >= 5 ? 'Big' : 'Small').slice(1, 10);
                     advancedEngine.feedback(nextPrediction.models, latestIssue.size, sizeHist);
                     // Save memory forever
                     if (!_quotaExceeded && WEIGHTS_DOC) {
                         safeSetDoc(WEIGHTS_DOC, { 
                              engineWeights: advancedEngine.getWeights(),
                              engineMemory: advancedEngine.getSequenceMemory() 
                         }, { merge: true }).catch(()=>{});
                     }
                 }`;

content = content.replace(tSearch, tRepl);

const bootSearch = `// Ensure engine loads weights on start
setTimeout(async () => {
    const ew = await getEngineWeights();
    if (ew) advancedEngine.setWeights(ew);
}, 5000);`;

const bootRepl = `// Ensure engine loads weights on start
setTimeout(async () => {
    try {
        if (!_quotaExceeded && WEIGHTS_DOC) {
            const snap = await getDoc(WEIGHTS_DOC);
            if (snap.exists()) {
                const data = snap.data();
                if (data.engineWeights) advancedEngine.setWeights(data.engineWeights);
                if (data.engineMemory) advancedEngine.setSequenceMemory(data.engineMemory);
            }
        }
    } catch(e) {}
}, 5000);`;

content = content.replace(bootSearch, bootRepl);

fs.writeFileSync('server.ts', content);
