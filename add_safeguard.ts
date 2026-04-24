import fs from 'fs';
let content = fs.readFileSync('server.ts', 'utf-8');

const sPred = `         // Strong LSTM Signal detection (threshold > 0.65 or < 0.35) override basic heuristics
         if (neuralConfidence > 0.65) {
             finalPrediction = 'Big';
             rawConfidence = neuralConfidence; 
         } else if (neuralConfidence < 0.35) {
             finalPrediction = 'Small';
             rawConfidence = 1 - neuralConfidence;
         }
     } catch (e) { console.error("Neural Activation error", e); }

     // General Entropy & Anomaly detection`;

const rPred = `         // Strong LSTM Signal detection (threshold > 0.65 or < 0.35) override basic heuristics
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
     const isTrendVague = Math.abs(neuralConfidence - 0.5) < 0.05;`;

if (content.includes(sPred)) content = content.replace(sPred, rPred);

const sSafe = `     if (entropy < 0.82) {
         isUnsafe = true;
         unsafeReason = "Market Imbalance (Low Entropy Segment)";
     } else if (volatility > 0.85) {
         isUnsafe = true;
         unsafeReason = "Hyper-Volatility (Too much sequence jumping)";
     }`;

const rSafe = `     if (entropy < 0.82) {
         isUnsafe = true;
         unsafeReason = "Market Imbalance (Low Entropy Segment)";
     } else if (volatility > 0.85) {
         isUnsafe = true;
         unsafeReason = "Hyper-Volatility (Too much sequence jumping)";
     } else if (isTrendVague) {
         isUnsafe = true;
         unsafeReason = "Dead Zone (Neural Net detects 50/50 probability)";
     }
     
     // CRITICAL: If market is unsafe, the engine should actively suggest 'SKIP'
     if (isUnsafe) {
         finalPrediction = 'SKIP';
         confidenceValue = 99; // 99% confident that you should SKIP
     }`;

if (content.includes(sSafe)) content = content.replace(sSafe, rSafe);

fs.writeFileSync('server.ts', content);
console.log("Safe guards injected");
