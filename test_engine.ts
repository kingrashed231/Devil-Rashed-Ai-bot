import { AdvancedPredictionEngine } from './PredictionEngine.js';

const engine = new AdvancedPredictionEngine();
const dummyHistory = [];
for(let i=0; i<30; i++) {
    dummyHistory.push({ size: Math.random() > 0.5 ? 'Big' : 'Small', number: Math.floor(Math.random() * 10) });
}

let res = engine.analyze(dummyHistory, 'AGGRESSIVE');
console.log(res);

let res2 = engine.analyze(dummyHistory, 'SAFE');
console.log(res2);
