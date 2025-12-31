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
| Min | 161.35ms |
| Max | 297.04ms |
| Avg | 186.09ms |
| P90 | 200.63ms |
| P95 | 276.34ms |
| P99 | 297.04ms |

Pricing: $0.05/M input, $0.08/M output | Speed: 840 TPS | Test count: 30 | Date: 2025-12-31

### Groq - openai/gpt-oss-20b

| Metric | Value |
|--------|-------|
| Min | 117.27ms |
| Max | 167.57ms |
| Avg | 123.86ms |
| P90 | 129.30ms |
| P95 | 136.16ms |
| P99 | 167.57ms |

Pricing: $0.075/M input, $0.30/M output | Speed: 1,000 TPS | Test count: 30 | Date: 2025-12-31

## How to run?

```bash
npm install
# Add API key to .env
npm start
```
