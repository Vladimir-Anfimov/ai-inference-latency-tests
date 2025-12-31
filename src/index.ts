import 'dotenv/config';
import { writeFileSync } from 'fs';
import { Groq } from 'groq-sdk';

const groq = new Groq({
    apiKey: process.env['GROQ_API_KEY'],
});

const MODEL = 'llama-3.1-8b-instant';
const TEST_COUNT = 30;
const MAX_TOKENS = 10;
const INPUT_TEXT = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in.';

function percentile(arr: number[], p: number): number {
    const sorted = [...arr].sort((a, b) => a - b);
    const index = Math.ceil((p / 100) * sorted.length) - 1;
    return sorted[Math.max(0, index)];
}

async function runTest(): Promise<number> {
    const startTime = performance.now();

    const chatCompletion = await groq.chat.completions.create({
        messages: [{ role: 'user', content: INPUT_TEXT }],
        model: MODEL,
        temperature: 1,
        max_tokens: MAX_TOKENS,
        top_p: 1,
        stream: true,
    });

    for await (const _ of chatCompletion) {
        // consume stream
    }

    return performance.now() - startTime;
}

function generateMarkdown(latencies: number[], stats: { min: number; max: number; avg: number; p90: number; p95: number; p99: number }): string {
    const timestamp = new Date().toISOString();

    return `# Latency Test Results

## Configuration
| Parameter | Value |
|-----------|-------|
| Provider | Groq |
| Model | ${MODEL} |
| Test Count | ${TEST_COUNT} |
| Max Tokens | ${MAX_TOKENS} |
| Input Length | ${INPUT_TEXT.length} chars |
| Timestamp | ${timestamp} |

## Results Summary
| Metric | Value |
|--------|-------|
| Min | ${stats.min.toFixed(2)}ms |
| Max | ${stats.max.toFixed(2)}ms |
| Avg | ${stats.avg.toFixed(2)}ms |
| P90 | ${stats.p90.toFixed(2)}ms |
| P95 | ${stats.p95.toFixed(2)}ms |
| P99 | ${stats.p99.toFixed(2)}ms |

## Individual Tests
| Test # | Latency (ms) |
|--------|--------------|
${latencies.map((l, i) => `| ${i + 1} | ${l.toFixed(2)} |`).join('\n')}
`;
}

async function main() {
    console.log(`Running ${TEST_COUNT} latency tests...\n`);

    const latencies: number[] = [];

    for (let i = 1; i <= TEST_COUNT; i++) {
        const latency = await runTest();
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

    const filename = `results/groq-${MODEL}-${Date.now()}.md`;
    const markdown = generateMarkdown(latencies, stats);
    writeFileSync(filename, markdown);
    console.log(`\nResults saved to ${filename}`);
}

main();
