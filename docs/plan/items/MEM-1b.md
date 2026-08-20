# MEM-1b

**MEM-1b** — An 8 GB heap flag on `build` and `typecheck`, of unmeasured necessity.
Owner: Implementer. Priority: P2. Measured 2026-08-20.

`package.json:30` and `package.json:36` both set `NODE_OPTIONS="--max-old-space-size=8192"`. An
external audit read this as masking a memory leak. That reading is plausible and **untested** — the
flag may equally be a correct accommodation of a large TypeScript project, and actual peak usage may
be nowhere near 8 GB.

Rule 10 binds criticism as tightly as praise: the flag is not a defect until there is a number.

## Required work

Measure peak resident memory on a clean `tsc --noEmit` and on `next build` (`/usr/bin/time -v`, or
bisect `--max-old-space-size` until failure). Record both figures here with the command used.

Then act on the measurement: if peak sits far below 8 GB, lower the flag to a headroom-adjusted real
figure; if it approaches 8 GB, the flag is load-bearing and the finding becomes an investigation into
why, not a flag change. Do not change the value before the measurement exists — a build that OOMs in
CI costs more than the flag does.

## Acceptance

- Peak memory for both commands recorded here, with the measuring command
- The flag either lowered to a justified figure, or documented as necessary with its evidence
