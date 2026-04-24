import fs from 'fs';

let content = fs.readFileSync('PredictionEngine.ts', 'utf8');

const tSearch = `    private stats = {`;
const tRepl = `    private sequenceMemory: Record<string, { Big: number, Small: number }> = {};

    public getSequenceMemory() { return this.sequenceMemory; }
    public setSequenceMemory(mem: any) { this.sequenceMemory = mem || {}; }

    private stats = {`;

content = content.replace(tSearch, tRepl);

const tSearch2 = `        // 🧩 5. Mirror & Momentum Logic`;
const tRepl2 = `        // 🧠 X. Deep Sequence Memory (Context-Aware AI)
        // Remembers exactly what happened in the past when the last 4 sizes appeared in this exact order.
        let seqPred = 'SKIP';
        let seqProb = 0;
        if (sizes.length >= 4) {
            const currentSeq = sizes.slice(0, 4).join(',');
            const mem = this.sequenceMemory[currentSeq];
            if (mem) {
                const total = mem.Big + mem.Small;
                if (total >= 3) {
                    if (mem.Big > mem.Small) {
                        seqPred = 'Big';
                        seqProb = mem.Big / total;
                    } else {
                        seqPred = 'Small';
                        seqProb = mem.Small / total;
                    }
                }
            }
        }
        if (seqPred !== 'SKIP') {
            individualPredictions['sequenceMem'] = seqPred;
            signalsUsed.push(\`Memory Match (\${Math.round(seqProb*100)}% WinRate)\`);
            if (seqPred === 'Big') scoreBig += 12 * seqProb;
            else scoreSmall += 12 * seqProb;
        }

        // 🧩 5. Mirror & Momentum Logic`;

content = content.replace(tSearch2, tRepl2);

const tSearch3 = `    public feedback(individualPredictions: Record<string, string>, actualResult: string) {`;
const tRepl3 = `    public feedback(individualPredictions: Record<string, string>, actualResult: string, historySizes?: string[]) {
        // Update Sequence Memory
        if (historySizes && historySizes.length >= 4) {
            const currentSeq = historySizes.slice(0, 4).join(',');
            if (!this.sequenceMemory[currentSeq]) this.sequenceMemory[currentSeq] = { Big: 0, Small: 0 };
            if (actualResult === 'Big') this.sequenceMemory[currentSeq].Big++;
            if (actualResult === 'Small') this.sequenceMemory[currentSeq].Small++;
        }

`;

content = content.replace(tSearch3, tRepl3);

fs.writeFileSync('PredictionEngine.ts', content);
