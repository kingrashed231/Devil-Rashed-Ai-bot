import fs from 'fs';
let content = fs.readFileSync('server.ts', 'utf-8');

const search = `     let finalPrediction = bigScore > smallScore ? 'Big' : 'Small';
     let rawConfidence = Math.max(bigScore, smallScore) / ((bigScore + smallScore) || 1);`;

const replace = `     let finalPrediction = bigScore > smallScore ? 'Big' : 'Small';
     let rawConfidence = Math.max(bigScore, smallScore) / ((bigScore + smallScore) || 1);

     // Connect Synaptic Core for Neural override
     await syncLSTMSmartBrain();
     let neuralConfidence = 0.5;
     try {
         const lastColor = shortHistory[0]?.size === 'Big' ? 1 : 0;
         const out = globalLSTM.activate([lastColor, 1]); 
         neuralConfidence = out[0];
         // Strong LSTM Signal detection (threshold > 0.65 or < 0.35) override basic heuristics
         if (neuralConfidence > 0.65) {
             finalPrediction = 'Big';
             rawConfidence = neuralConfidence; 
         } else if (neuralConfidence < 0.35) {
             finalPrediction = 'Small';
             rawConfidence = 1 - neuralConfidence;
         }
     } catch (e) { console.error("Neural Activation error", e); }`;

if (content.includes(search)) {
    content = content.replace(search, replace);
    fs.writeFileSync('server.ts', content);
    console.log("Synaptic prediction overrides injected.");
} else {
    console.log("NOT FOUND!");
}
