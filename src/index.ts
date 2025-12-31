import 'dotenv/config';
import { writeFileSync } from 'fs';
import { Groq } from 'groq-sdk';

const groq = new Groq({
    apiKey: process.env['GROQ_API_KEY'],
});

const MODELS = ['llama-3.1-8b-instant', 'openai/gpt-oss-20b'];
const TEST_COUNT = 30;
const MAX_TOKENS = 10;
const INPUT_TEXT = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in.';

const PRICING: Record<string, { input: string; output: string; speed: string }> = {
    'llama-3.1-8b-instant': { input: '$0.05', output: '$0.08', speed: '840 TPS' },
    'openai/gpt-oss-20b': { input: '$0.075', output: '$0.30', speed: '1,000 TPS' },
};

function percentile(arr: number[], p: number): number {
    const sorted = [...arr].sort((a, b) => a - b);
    const index = Math.ceil((p / 100) * sorted.length) - 1;
    return sorted[Math.max(0, index)];
}

async function runTest(model: string): Promise<number> {
    const startTime = performance.now();

    const params: any = {
        messages: [{ role: 'user', content: INPUT_TEXT }],
        model,
        temperature: 1,
        max_tokens: MAX_TOKENS,
        top_p: 1,
        stream: true,
    };

    if (model.includes('gpt-oss')) {
        params.reasoning_effort = 'low';
    }

    const chatCompletion = await groq.chat.completions.create(params);

    for await (const _ of chatCompletion as any) {
        // consume stream
    }

    return performance.now() - startTime;
}

interface ModelResult {
    model: string;
    stats: { min: number; max: number; avg: number; p90: number; p95: number; p99: number };
    date: string;
    testCount: number;
}

function generateReadme(results: ModelResult[]): string {
    let md = `# AI Inference Speed Test

Latency testing for AI inference providers. Tests are run from Romania to US-based servers, reflecting real-world latency for European users.

## What are we testing?

Measuring end-to-end latency for text classification requests:
- Input: ~250 characters
- Output: max 10 tokens
- Streaming enabled

## Results

`;

    for (const r of results) {
        const pricing = PRICING[r.model];
        md += `### Groq - ${r.model}

| Metric | Value |
|--------|-------|
| Min | ${r.stats.min.toFixed(2)}ms |
| Max | ${r.stats.max.toFixed(2)}ms |
| Avg | ${r.stats.avg.toFixed(2)}ms |
| P90 | ${r.stats.p90.toFixed(2)}ms |
| P95 | ${r.stats.p95.toFixed(2)}ms |
| P99 | ${r.stats.p99.toFixed(2)}ms |

Pricing: ${pricing.input}/M input, ${pricing.output}/M output | Speed: ${pricing.speed} | Test count: ${r.testCount} | Date: ${r.date}

`;
    }

    md += `## How to run?

\`\`\`bash
npm install
# Add API key to .env
npm start
\`\`\`
`;

    return md;
}

async function testModel(model: string): Promise<ModelResult> {
    console.log(`\n${'='.repeat(50)}`);
    console.log(`Testing: ${model}`);
    console.log(`${'='.repeat(50)}\n`);

    const latencies: number[] = [];

    for (let i = 1; i <= TEST_COUNT; i++) {
        const latency = await runTest(model);
        latencies.push(latency);
        console.log(`Test ${i}/${TEST_COUNT}: ${latency.toFixed(2)}ms`);
    }

    const stats = {
        min: Math.min(...latencies),
        max: Math.max(...latencies),
        avg: latencies.reduce((a, b) => a + b, 0) / latencies.length,
        p90: percentile(latencies, 90),
        p95: percentile(latencies, 95),
        p99: percentile(latencies, 99),
    };

    console.log('\n--- Results ---');
    console.log(`Min:  ${stats.min.toFixed(2)}ms`);
    console.log(`Max:  ${stats.max.toFixed(2)}ms`);
    console.log(`Avg:  ${stats.avg.toFixed(2)}ms`);
    console.log(`P90:  ${stats.p90.toFixed(2)}ms`);
    console.log(`P95:  ${stats.p95.toFixed(2)}ms`);
    console.log(`P99:  ${stats.p99.toFixed(2)}ms`);

    return {
        model,
        stats,
        date: new Date().toISOString().split('T')[0],
        testCount: TEST_COUNT,
    };
}

async function main() {
    const results: ModelResult[] = [];

    for (const model of MODELS) {
        const result = await testModel(model);
        results.push(result);
    }

    const readme = generateReadme(results);
    writeFileSync('README.md', readme);
    console.log('\nResults saved to README.md');
}

main();
