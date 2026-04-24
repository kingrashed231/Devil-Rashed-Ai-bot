import fs from 'fs';
let content = fs.readFileSync('server.ts', 'utf-8');

const sLearn = `                     const isBig = latestIssue.size === 'Big' ? 1 : 0;
                     const wasBig = nextPrediction.suggest === 'Big' ? 1 : 0;
                     // Train based on what was the previous output vs actual
                     rashedTrainer.train([{ input: [wasBig, 1], output: [isBig] }], {`;

const rLearn = `                     const isBig = latestIssue.size === 'Big' ? 1 : 0;
                     // Advanced Trend Setup: train on last known sequence (shortHistory has newest at 0)
                     const hist = shortHistory || [];
                     const n1 = hist[1]?.size === 'Big' ? 1 : 0;
                     const n2 = hist[2]?.size === 'Big' ? 1 : 0;
                     const n3 = hist[3]?.size === 'Big' ? 1 : 0;
                     const isTrendBreak = (n1 === n2 && n2 === n3 && isBig !== n1) ? 1 : 0;
                     const inputVector = [n1, n2, n3, isTrendBreak]; // 4 inputs
                     rashedTrainer.train([{ input: inputVector, output: [isBig] }], {`;

const sArch = `// Deep LSTM architecture: 2 inputs (Trend change, Big/Small), 6 hidden, 1 output (Big or Small)
let globalLSTM = new Architect.LSTM(2, 6, 1);`;

const rArch = `// Deep LSTM advanced architecture: 4 inputs (n1, n2, n3, isTrendBreak), 8 hidden, 1 output (Big or Small)
let globalLSTM = new Architect.LSTM(4, 8, 1);`;

const sPred = `         const lastColor = shortHistory[0]?.size === 'Big' ? 1 : 0;
         const out = globalLSTM.activate([lastColor, 1]); 
         neuralConfidence = out[0];`;

const rPred = `         const n1 = shortHistory[0]?.size === 'Big' ? 1 : 0;
         const n2 = shortHistory[1]?.size === 'Big' ? 1 : 0;
         const n3 = shortHistory[2]?.size === 'Big' ? 1 : 0;
         const isTrendBreak = (n1 === n2 && n2 === n3) ? 1 : 0; // if it was trending, will it break now?
         const out = globalLSTM.activate([n1, n2, n3, isTrendBreak]); 
         
         neuralConfidence = out[0];`;


if (content.includes(sLearn)) content = content.replace(sLearn, rLearn);
if (content.includes(sArch)) content = content.replace(sArch, rArch);
if (content.includes(sPred)) content = content.replace(sPred, rPred);

fs.writeFileSync('server.ts', content);
console.log("Trend logic injected!");
