import fs from 'fs';

let content = fs.readFileSync('PredictionEngine.ts', 'utf8');

const tSearch = `    private stats = {`;
const tRepl = `    public getWeights() { return this.weights; }
    public setWeights(w: Record<string, number>) { this.weights = { ...this.weights, ...w }; }

    private stats = {`;

content = content.replace(tSearch, tRepl);

fs.writeFileSync('PredictionEngine.ts', content);
