# V2 Comparison Metrics

> This directory will contain metrics from v2 runs for comparison with baseline.

## Structure

```
comparison/
├── README.md           # This file
├── runs/               # Individual run reports (same template as baseline)
│   ├── orchestrate-[task].md
│   └── poc-[task].md
└── analysis.md         # Side-by-side comparison with baseline
```

## How to Use

1. Complete baseline runs first (see `../baseline/`)
2. Implement v2 changes
3. Run equivalent tasks through v2
4. Record using same template as baseline
5. Create `analysis.md` comparing results

## Comparison Dimensions

- **Speed**: Total time, parallelization savings
- **Quality**: First-pass rate, retry count
- **Human time**: Gate wait times, intervention frequency
- **Usability**: Subjective feedback on gates, pause/resume, memory

## Status

- [ ] Baseline complete
- [ ] V2 implemented
- [ ] V2 runs complete
- [ ] Analysis complete
