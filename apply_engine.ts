import fs from 'fs';
let content = fs.readFileSync('server.ts', 'utf8');

// 1. Remove node-cron completely as it is "not working" properly
content = content.replace(/import cron from 'node-cron';/g, '');

const searchHooks = `// ====== OFFLINE HOOK / ACTIVE ENGINE ======
// Keeps the backend aggressively active even without external requests 
cron.schedule('*/1 * * * *', () => {
    axios.get('http://127.0.0.1:3000/api/health', { timeout: 2000 }).catch(()=>{});
});

// ====== ARTIFICIAL BRAIN (Smartest Background Trainer) ======
cron.schedule('*/5 * * * *', async () => {`;
const replaceHooks = `// ====== OFFLINE HOOK / ACTIVE ENGINE ======
// Keeps the backend aggressively active even without external requests 
setInterval(() => {
    axios.get('http://127.0.0.1:3000/api/health', { timeout: 2000 }).catch(()=>{});
}, 60000);

// ====== ARTIFICIAL BRAIN (Smartest Background Trainer) ======
setInterval(async () => {`;
content = content.replace(searchHooks, replaceHooks);

// Fix closing bracket of cron inside training loop
content = content.replace(/        console\.log\("🧠 Artificial Brain Background Training Cycle Completed!"\);\n    } catch\(e\) \{\}\n\}\);/, `        console.log("🧠 Artificial Brain Background Training Cycle Completed!");\n    } catch(e) {}\n}, 300000);`);

// 2. We import PredictionEngine into server.ts and replace `analyzeAdvancedMarketWithML` interior logic
const insertEngineImport = `import { AdvancedPredictionEngine } from './PredictionEngine';
const advancedEngine = new AdvancedPredictionEngine();`;

content = content.replace(/import { doc, getDoc,/g, `${insertEngineImport}\nimport { doc, getDoc,`);

// Modify analyzeAdvancedMarketWithML logic to run through the new class
const targetMLFunc = `async function analyzeAdvancedMarketWithML(historyRaw: any[], adminData: any) {
     if (historyRaw.length > 0) await saveHistoryData(historyRaw[0]);
     const dbHistory = await getHistoryData();

     const shortHistory = historyRaw.map((item: any) => ({
         size: Number(item.number) >= 5 ? 'Big' : 'Small',
         number: Number(item.number)
     })).slice(0, 500); 

     const longHistory = dbHistory.length > 100 ? dbHistory : historyRaw;
     const normalizedLongHistory = longHistory.map((item: any) => ({
         size: Number(item.number) >= 5 ? 'Big' : 'Small'
     })).slice(0, 2000);

     const { preds, confs } = runEnsembleModels(normalizedLongHistory, shortHistory);
     
     // 30-Model Ensemble Aggregation
     const weights = await getDynamicWeights();
     let bigScore = 0; let smallScore = 0;
     
     for (let i=0; i<NUM_MODELS; i++) {
         if (preds[i] === 'Big') bigScore += confs[i] * weights[i];
         else smallScore += confs[i] * weights[i];
     }

     let finalPrediction = bigScore > smallScore ? 'Big' : 'Small';
     let rawConfidence = Math.max(bigScore, smallScore) / ((bigScore + smallScore) || 1);

     // Connect Synaptic Core for Neural override
     await syncLSTMSmartBrain();
     let neuralConfidence = 0.5;
     try {
         let inputVector: number[] = [];
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
         
         const out = globalLSTM.activate(inputVector); 
         
         neuralConfidence = out[0];
         // Strong LSTM Signal detection (threshold > 0.65 or < 0.35) override basic heuristics
         if (neuralConfidence > 0.65) {
             finalPrediction = 'Big';
             rawConfidence = neuralConfidence; 
         } else if (neuralConfidence < 0.35) {
             finalPrediction = 'Small';
             rawConfidence = 1 - neuralConfidence;
         } else {
             // In medium confidence, align with last winning sequence to prevent choppy trades
             const recent = shortHistory.slice(0, 5);
             if (recent[0] && recent[1] && recent[0].size === recent[1].size) {
                 finalPrediction = recent[0].size;
             }
         }
     } catch (e) { console.error("Neural Activation error", e); }

     // General Entropy & Anomaly detection
     // Additional strict ML validation safeguard
     const isTrendVague = Math.abs(neuralConfidence - 0.5) < 0.05;
     const bTotal = shortHistory.slice(0,50).filter((x:any)=>x.size==='Big').length;
     const pB = bTotal / Math.min(50, shortHistory.length);
     const pS = 1 - pB;
     const entropy = (pB > 0 && pS > 0) ? -(pB * Math.log2(pB) + pS * Math.log2(pS)) : 0;
     
     let changes = 0;
     for(let i=1; i< shortHistory.slice(0,30).length; i++) {
        if(shortHistory[i].size !== shortHistory[i-1].size) changes++;
     }
     const volatility = changes / Math.min(30, shortHistory.length || 1);

     let isUnsafe = false;
     let unsafeReason = "";
     if (entropy < 0.82) {
         isUnsafe = true;
         unsafeReason = "Market Imbalance (Low Entropy Segment)";
     } else if (volatility > 0.85) {
         isUnsafe = true;
         unsafeReason = "Hyper-Volatility (Too much sequence jumping)";
     } else if (isTrendVague) {
         isUnsafe = true;
         unsafeReason = "Dead Zone (Neural Net detects 50/50 probability)";
     }
     
     let confidenceValue = 75 + Math.floor((rawConfidence - 0.5) * 50);
     if (confidenceValue > 99) confidenceValue = 99;
     if (confidenceValue < 70) confidenceValue = 70;

     // CRITICAL: If market is unsafe, the engine should actively suggest 'SKIP'
     if (isUnsafe) {
         finalPrediction = 'SKIP';
         confidenceValue = 99; // 99% confident that you should SKIP
     }

     if (adminData.manualOverride) {
         finalPrediction = adminData.manualOverride;
     }

     return {
        predictionValue: finalPrediction,
        confidenceValue: \`\${confidenceValue}%\`\,
        isUnsafe,
        unsafeReason,
        details: \`Vol: \${(volatility*100).toFixed(0)}%\`\,
        models: preds 
     };
}`;

const replacementMLFunc = `async function analyzeAdvancedMarketWithML(historyRaw: any[], adminData: any) {
    if (historyRaw.length > 0) await saveHistoryData(historyRaw[0]);
    const dbHistory = await getHistoryData();

    const shortHistory = historyRaw.map((item: any) => ({
        size: Number(item.number) >= 5 ? 'Big' : 'Small',
        number: Number(item.number)
    })).slice(0, 500); 

    // Neural Integration
    await syncLSTMSmartBrain();
    let neuralConfidence = 0.5;
    try {
        let inputVector: number[] = [];
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
        const out = globalLSTM.activate(inputVector); 
        neuralConfidence = out[0];
    } catch (e) { }

    const mode = adminData.userMode === 'SAFE' ? 'SAFE' : 'AGGRESSIVE';
    const advancedOutput = advancedEngine.analyze(shortHistory, mode);

    let finalPrediction = advancedOutput.size;
    let finalConfidence = advancedOutput.confidence;

     if (adminData.manualOverride) {
         finalPrediction = adminData.manualOverride;
     }

     return {
        predictionValue: finalPrediction,
        confidenceValue: \`\${finalConfidence}%\`\,
        isUnsafe: advancedOutput.safety === 'UNSAFE',
        safetyMode: advancedOutput.safety,
        unsafeReason: advancedOutput.unsafeReason,
        details: advancedOutput.reasoning.join(' | '),
        models: advancedOutput.individualPredictions,
        signalsUsed: advancedOutput.signalsUsed,
        predictedNumber: advancedOutput.number
     };
}`;
content = content.replace(targetMLFunc, replacementMLFunc);

// Fix Self Learning Dynamic Weight loop
const searchUpdateWeight = `                 // ---> SELF LEARNING UPDATE <---
                 if (nextPrediction.models && Array.isArray(nextPrediction.models)) {
                      await updateDynamicWeights(latestIssue.size, nextPrediction.models);
                 }`;
const replaceUpdateWeight = `                 // ---> SELF LEARNING UPDATE <---
                 if (nextPrediction.models && typeof nextPrediction.models === 'object' && !Array.isArray(nextPrediction.models)) {
                      advancedEngine.feedback(nextPrediction.models, latestIssue.size);
                 }`;
content = content.replace(searchUpdateWeight, replaceUpdateWeight);

// Fix the message UI replacing "Auto-Learning Active" with the real signals string length or number 
const searchMsgText = `             const marketStatusAlert = advancedAnalysis.isUnsafe ? 
                        \`\\n\\n⚠️ *Market Risk:* \${advancedAnalysis.unsafeReason}\` : "";

             const safeStr = advancedAnalysis.isUnsafe ? '⚠️ Risky' : '✅ V-Safe';
             const suggestPretty = nextPrediction.suggest === 'Big' ? '🟢 *B I G* 🟢' : (nextPrediction.suggest === 'Small' ? '🔴 *S M A L L* 🔴' : '🛑 *S K I P (Market Risk)* 🛑');

             const newMsgText = \`💎 *𝗣𝗥𝗘𝗠𝗜𝗨𝗠 𝗦𝗨𝗣𝗘𝗥 𝗕𝗥𝗔𝗜𝗡 𝗔𝗜* 💎\\n*━━━━━━━━━━━━━━━━━━━━*\\n> 🔖 *𝗣𝗲𝗿𝗶𝗼𝗱:* \\\`\${nextPrediction.issue}\\\`\\n> 📊 *𝗟𝗲𝘃𝗲𝗹:*  Lvl \${Math.min(globalLossStreak + 1, 6)} Bet\\n\\n🧠 *𝗔𝗜 𝗣𝗿𝗲𝗱𝗶𝗰𝘁𝗶𝗼𝗻:*\\n👉  *\${suggestPretty}*  👈\\n\\n> 🎯 *𝗖𝗼𝗻𝗳𝗶𝗱𝗲𝗻𝗰𝗲:* \\\`\${nextPrediction.confidence.includes('%') ? nextPrediction.confidence : nextPrediction.confidence + '%'}\\\`\\n> 🛡️ *𝗔𝗻𝗮𝗹𝘆𝘀𝗶𝘀:* \\\`120 Deep ML Array\\\`\\n> ⚡ \\\`Auto-Learning Active\\\` \${safeStr}\\n*━━━━━━━━━━━━━━━━━━━━*\\n\${marketStatusAlert}\`;`;

const replaceMsgText = `             const marketStatusAlert = advancedAnalysis.isUnsafe ? 
                        \`\\n\\n⚠️ *Market Risk:* \${advancedAnalysis.unsafeReason}\` : "";

             const safeEmo = advancedAnalysis.safetyMode === 'SAFE' ? '✅ HIGHLY SAFE' : (advancedAnalysis.safetyMode === 'RISKY' ? '⚠️ RISKY PLAY' : '🛑 UNSAFE');
             const suggestPretty = nextPrediction.suggest === 'Big' ? '🟢 *B I G* 🟢' : (nextPrediction.suggest === 'Small' ? '🔴 *S M A L L* 🔴' : '🛑 *S K I P* 🛑');

             const numStr = advancedAnalysis.predictedNumber !== null ? \`\\n> 🎰 *𝗣𝗿𝗼𝗯𝗮𝗯𝗹𝗲 𝗡𝘂𝗺𝗯𝗲𝗿:*  \\\` \${advancedAnalysis.predictedNumber} \\\`\` : '';

             const newMsgText = \`💎 *𝗣𝗥𝗘𝗠𝗜𝗨𝗠 𝗦𝗨𝗣𝗘𝗥 𝗕𝗥𝗔𝗜𝗡 𝗔𝗜* 💎\\n*━━━━━━━━━━━━━━━━━━━━*\\n> 🔖 *𝗣𝗲𝗿𝗶𝗼𝗱:* \\\`\${nextPrediction.issue}\\\`\\n> 📊 *𝗟𝗲𝘃𝗲𝗹:*  Lvl \${Math.min(globalLossStreak + 1, 6)} Bet\${numStr}\\n\\n🧠 *𝗔𝗜 𝗣𝗿𝗲𝗱𝗶𝗰𝘁𝗶𝗼𝗻:*\\n👉  *\${suggestPretty}*  👈\\n\\n> 🎯 *𝗖𝗼𝗻𝗳𝗶𝗱𝗲𝗻𝗰𝗲:* \\\`\${nextPrediction.confidence.includes('%') ? nextPrediction.confidence : nextPrediction.confidence + '%'}\\\`\\n> 🛡️ *𝗔𝗻𝗮𝗹𝘆𝘀𝗶𝘀:* \\\`\${advancedAnalysis.signalsUsed?.length || 'Multiple'} Sub-Models Integrated\\\`\\n> ⚡ *𝗦𝗮𝗳𝗲𝘁𝘆:* \`\${safeEmo}\`\\n*━━━━━━━━━━━━━━━━━━━━*\\n\${marketStatusAlert}\`;`;
             
content = content.replace(searchMsgText, replaceMsgText);

// Fix exact confidence UI real-time string fix countdown
content = content.replace(/> 🛡️ \*𝗔𝗻𝗮𝗹𝘆𝘀𝗶𝘀:\* \`120 Deep ML Variables\`\\n> ⚡ \`Auto-Learning Enabled\`/g, "> 🛡️ *𝗔𝗻𝗮𝗹𝘆𝘀𝗶𝘀:* `Advanced Prediction Engine`\\n> ⚡ *𝗔𝗰𝘁𝗶𝗼𝗻:* `System Armed`");

fs.writeFileSync('server.ts', content);
console.log("Refactored into advanced prediction engine successfully!");
