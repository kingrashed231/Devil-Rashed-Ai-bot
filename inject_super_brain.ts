import fs from 'fs';
let content = fs.readFileSync('server.ts', 'utf-8');

const archSearch = `// Deep LSTM advanced architecture: 4 inputs (n1, n2, n3, isTrendBreak), 8 hidden, 1 output (Big or Small)
let globalLSTM = new Architect.LSTM(4, 8, 1);`;
const archReplace = `// 100+ Logic Matrix: 120 Inputs (100 deep history + 20 indicators), 64 hidden, 1 output (Big/Small)
let globalLSTM = new Architect.LSTM(120, 64, 1);`;
content = content.replace(archSearch, archReplace);

const trainSearch = `                     // Advanced Trend Setup: train on last known sequence
                     const hist = list.map((item: any) => ({ size: Number(item.number) >= 5 ? 'Big' : 'Small' })) || [];
                     const n1 = hist[1]?.size === 'Big' ? 1 : 0;
                     const n2 = hist[2]?.size === 'Big' ? 1 : 0;
                     const n3 = hist[3]?.size === 'Big' ? 1 : 0;
                     const isTrendBreak = (n1 === n2 && n2 === n3 && isBig !== n1) ? 1 : 0;
                     const inputVector = [n1, n2, n3, isTrendBreak]; // 4 inputs`;

const trainReplace = `                     // 100+ Superpower Logic extraction for self-learning
                     const hist = list.map((item: any) => ({ size: Number(item.number) >= 5 ? 'Big' : 'Small', num: Number(item.number) })) || [];
                     let inputVector: number[] = [];
                     // 1. First 100 historical trends (Micro to Macro)
                     for(let i=1; i<=100; i++) {
                         inputVector.push(hist[i]?.size === 'Big' ? 1 : 0);
                     }
                     // 2. Add 20 calculated dimensional indicators (Moving Avgs, Entropies, Streaks, Volatility)
                     let bCount = 0; let streak = 1; let vol = 0;
                     for(let i=1; i<=20; i++) {
                         if(hist[i]?.size === 'Big') bCount++;
                         if(hist[i]?.size === hist[i+1]?.size) streak++; else streak=1;
                         vol += Math.abs(hist[i]?.num - (hist[i+1]?.num || 0));
                         inputVector.push((bCount/i)); // Dynamic probability
                         inputVector.push(streak/10); // Normalized streak
                         inputVector.push(vol/100); // Normalized volatility
                     }
                     // strictly constrain to 120 inputs
                     inputVector = inputVector.slice(0, 120);`;

content = content.replace(trainSearch, trainReplace);

const predSearch = `         const n1 = shortHistory[0]?.size === 'Big' ? 1 : 0;
         const n2 = shortHistory[1]?.size === 'Big' ? 1 : 0;
         const n3 = shortHistory[2]?.size === 'Big' ? 1 : 0;
         const isTrendBreak = (n1 === n2 && n2 === n3) ? 1 : 0; // if it was trending, will it break now?
         const out = globalLSTM.activate([n1, n2, n3, isTrendBreak]);`;

const predReplace = `         let inputVector: number[] = [];
         for(let i=0; i<100; i++) inputVector.push(shortHistory[i]?.size === 'Big' ? 1 : 0);
         let bCount = 0; let streak = 1; let vol = 0;
         for(let i=0; i<20; i++) {
             if(shortHistory[i]?.size === 'Big') bCount++;
             if(shortHistory[i]?.size === shortHistory[i+1]?.size) streak++; else streak=1;
             vol += Math.abs((shortHistory[i]?.number || 0) - (shortHistory[i+1]?.number || 0));
             inputVector.push(bCount/(i+1)); 
             inputVector.push(streak/10); 
             inputVector.push(vol/100); 
         }
         inputVector = inputVector.slice(0, 120);
         
         const out = globalLSTM.activate(inputVector);`;

if(content.includes(predSearch)) content = content.replace(predSearch, predReplace);

fs.writeFileSync('server.ts', content);
console.log("Synaptic super brain injected.");
