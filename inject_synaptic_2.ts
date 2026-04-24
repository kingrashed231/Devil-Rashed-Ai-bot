import fs from 'fs';
let content = fs.readFileSync('server.ts', 'utf-8');

const search = `                 if (nextPrediction.models && Array.isArray(nextPrediction.models)) {
                      await updateDynamicWeights(latestIssue.size, nextPrediction.models);
                 }`;

const replace = `                 if (nextPrediction.models && Array.isArray(nextPrediction.models)) {
                      await updateDynamicWeights(latestIssue.size, nextPrediction.models);
                 }
                 
                 // ---> SYNAPTIC NEURAL NET DEEP LEARNING <---
                 try {
                     const isBig = latestIssue.size === 'Big' ? 1 : 0;
                     const wasBig = nextPrediction.suggest === 'Big' ? 1 : 0;
                     // Train based on what was the previous output vs actual
                     rashedTrainer.train([{ input: [wasBig, 1], output: [isBig] }], {
                         rate: 0.1,
                         iterations: 5,
                         error: 0.005,
                         shuffle: true
                     });
                     saveLSTMSmartBrain(); // Async background matrix save
                 } catch(err) { console.error("Neural training error", err); }
`;
if (content.includes(search)) {
    content = content.replace(search, replace);
    fs.writeFileSync('server.ts', content);
    console.log("Deep learning injected.");
} else {
    console.log("NOT FOUND!");
}
