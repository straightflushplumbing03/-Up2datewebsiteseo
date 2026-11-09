#!/usr/bin/env python3
"""A/A noise check for GSC rank experiments.

Before reading a rank test, measure how far the metric moves when NOTHING
changes. Input is a JSON snapshot of daily GSC rows per arm
(``[date, query, impressions, position]``). For each arm it prints the weekly
impression-weighted position and share of impressions at position <= 20, then
bootstraps the same rows into two random windows of ``--window`` days' worth of
impressions to estimate the null spread of (a) a before/after difference for
one arm and (b) a difference-in-differences between two arms.

Offline, deterministic (seeded), standard library only.

    python3 scripts/gsc_noise_check.py growth-engine/data/gsc_aa_noise_check_2026-11-09.json
"""
import argparse
import datetime as dt
import json
import random
import statistics as st


def expand(rows):
    """One position per impression (GSC average position, repeated)."""
    return [float(p) for _d, _q, i, p in rows for _ in range(int(i))]


def weekly(rows, start):
    weeks = {}
    for d, _q, i, p in rows:
        w = (dt.date.fromisoformat(d) - start).days // 7
        weeks.setdefault(w, []).append((int(i), float(p)))
    out = []
    for w in sorted(weeks):
        imp = sum(i for i, _ in weeks[w])
        pos = sum(i * p for i, p in weeks[w]) / imp
        top = sum(i for i, p in weeks[w] if p <= 20) / imp
        out.append({"week_start": str(start + dt.timedelta(days=7 * w)),
                    "impressions": imp, "wpos": round(pos, 1), "share_le_20": round(top, 2)})
    return out


def null_diffs(pool, n, rng, iters):
    """Mean-position difference between two random draws of n impressions."""
    diffs = []
    for _ in range(iters):
        a = [rng.choice(pool) for _ in range(n)]
        b = [rng.choice(pool) for _ in range(n)]
        diffs.append(st.mean(a) - st.mean(b))
    return diffs


def quantile(xs, q):
    xs = sorted(xs)
    return xs[min(len(xs) - 1, max(0, int(q * len(xs))))]


def analyse(snapshot, window=28, iters=4000, seed=20261109, threshold=5.0):
    rng = random.Random(seed)
    start = dt.date.fromisoformat(snapshot["window"][0])
    end = dt.date.fromisoformat(snapshot["window"][1])
    span = (end - start).days + 1
    report = {"arms": {}}
    nulls = {}
    for name, arm in snapshot["arms"].items():
        pool = expand(arm["rows"])
        n = max(1, round(len(pool) * window / span))
        diffs = null_diffs(pool, n, rng, iters)
        nulls[name] = diffs
        wk = weekly(arm["rows"], start)
        report["arms"][name] = {
            "impressions_total": len(pool),
            "impressions_per_window": n,
            "weekly": wk,
            "weekly_wpos_sd": round(st.stdev([w["wpos"] for w in wk]), 1) if len(wk) > 1 else None,
            "null_diff_90pct": [round(quantile(diffs, 0.05), 1), round(quantile(diffs, 0.95), 1)],
        }
    names = list(nulls)
    if len(names) >= 2:
        a, c = nulls[names[0]], nulls[names[1]]
        did = [x - y for x, y in zip(a, c)]
        report["did"] = {
            "arms": names[:2],
            "null_90pct": [round(quantile(did, 0.05), 1), round(quantile(did, 0.95), 1)],
            "p_false_supported": round(sum(d <= -threshold for d in did) / len(did), 2),
            "p_within_3": round(sum(abs(d) <= 3 for d in did) / len(did), 2),
            "threshold": threshold,
        }
    return report


def main():
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("snapshot")
    ap.add_argument("--window", type=int, default=28)
    ap.add_argument("--iters", type=int, default=4000)
    ap.add_argument("--seed", type=int, default=20261109)
    ap.add_argument("--threshold", type=float, default=5.0,
                    help="positions A must beat C by to call 'supported'")
    args = ap.parse_args()
    with open(args.snapshot, encoding="utf-8") as fh:
        snap = json.load(fh)
    print(json.dumps(analyse(snap, args.window, args.iters, args.seed, args.threshold), indent=1))


if __name__ == "__main__":
    main()
