# AI Inference Speed Test

Latency testing for AI inference providers. Tests are run from Romania to US-based servers, reflecting real-world latency for European users.

## What are we testing?

Measuring end-to-end latency for text classification requests:
- Input: ~250 characters
- Output: max 10 tokens
- Streaming enabled

## Results

### Groq - llama-3.1-8b-instant

| Metric | Value |
|--------|-------|
| Min | 165.40ms |
| Max | 272.59ms |
| Avg | 183.79ms |
| P90 | 212.73ms |
| P95 | 241.91ms |
| P99 | 272.59ms |

Test count: 30 | Date: 2025-12-31

## How to run?

```bash
npm install
# Add API key to .env
npm start
```

Results are saved automatically to `results/`.
