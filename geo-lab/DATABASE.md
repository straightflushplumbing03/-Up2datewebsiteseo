# Database

SQLite via Node's built-in `node:sqlite`. The schema is applied idempotently on first connection (`getDb()`), so there is no separate migration step to forget. The file lives at `GEO_LAB_DB` or `data/geo-lab.db` (gitignored).

## Grouping

- **Identity & access** — `users`, `sessions`, `audit_log`
- **Website intelligence** — `pages`, `page_snapshots`, `sections`, `geo_scores`
- **AI visibility** — `queries`, `visibility_runs`, `visibility_results`
- **Competitors** — `competitors`, `competitor_observations`
- **Entity** — `entity_checks`, `entity_facts`
- **Experiments** — `experiments`, `experiment_measurements`
- **Optimization & publishing** — `opportunities`, `publications`
- **Operations** — `agent_runs`, `activity`, `tasks`, `technical_health_history`
- **Reporting & cost** — `reports`, `cost_entries`, `integrations`
- **Knowledge** — `research_notes`, `citation_actions`, `schema_meta`

## Conventions

- Timestamps are TEXT `datetime('now')` in UTC.
- History tables append; state tables are keyed for idempotent upsert.
- `geo_scores` stores both page-level (`section_id IS NULL`) and section-level rows, so trends work at either granularity.
- `opportunities.dedupe_key` is UNIQUE — this is what stops the daily run from creating the same recommendation twice.
- `publications.rollback_of` links a rollback to the change it undid.
- `activity.run_id` references `agent_runs` only; other run ids are recorded in `evidence`.

## Tables

### `schema_meta`

| Column | Definition |
|---|---|
| `key` | `TEXT PRIMARY KEY` |
| `value` | `TEXT NOT NULL` |

### `users`

| Column | Definition |
|---|---|
| `id` | `INTEGER PRIMARY KEY AUTOINCREMENT` |
| `email` | `TEXT NOT NULL UNIQUE` |
| `name` | `TEXT NOT NULL` |
| `role` | `TEXT NOT NULL CHECK (role IN ('owner','operator','viewer'))` |
| `password_hash` | `TEXT NOT NULL` |
| `created_at` | `TEXT NOT NULL DEFAULT (datetime('now'))` |
| `last_login_at` | `TEXT` |

### `sessions`

| Column | Definition |
|---|---|
| `token` | `TEXT PRIMARY KEY` |
| `user_id` | `INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE` |
| `created_at` | `TEXT NOT NULL DEFAULT (datetime('now'))` |
| `expires_at` | `TEXT NOT NULL` |
| `user_agent` | `TEXT` |

### `audit_log`

| Column | Definition |
|---|---|
| `id` | `INTEGER PRIMARY KEY AUTOINCREMENT` |
| `ts` | `TEXT NOT NULL DEFAULT (datetime('now'))` |
| `actor` | `TEXT NOT NULL` |
| `action` | `TEXT NOT NULL` |
| `target` | `TEXT` |
| `detail` | `TEXT` |

### `pages`

| Column | Definition |
|---|---|
| `id` | `INTEGER PRIMARY KEY AUTOINCREMENT` |
| `url` | `TEXT NOT NULL UNIQUE` |
| `path` | `TEXT NOT NULL` |
| `title` | `TEXT` |
| `meta_desc` | `TEXT` |
| `canonical` | `TEXT` |
| `robots_meta` | `TEXT` |
| `indexable` | `INTEGER NOT NULL DEFAULT 1` |
| `http_status` | `INTEGER` |
| `word_count` | `INTEGER` |
| `jsonld_blocks` | `INTEGER DEFAULT 0` |
| `schema_types` | `TEXT` |
| `h1_count` | `INTEGER DEFAULT 0` |
| `heading_skips` | `INTEGER DEFAULT 0` |
| `in_sitemap` | `INTEGER DEFAULT 0` |
| `internal_links` | `INTEGER DEFAULT 0` |
| `updated_at` | `TEXT NOT NULL DEFAULT (datetime('now'))` |

### `page_snapshots`

| Column | Definition |
|---|---|
| `id` | `INTEGER PRIMARY KEY AUTOINCREMENT` |
| `page_id` | `INTEGER NOT NULL REFERENCES pages(id) ON DELETE CASCADE` |
| `ts` | `TEXT NOT NULL DEFAULT (datetime('now'))` |
| `content_hash` | `TEXT NOT NULL` |
| `html_path` | `TEXT` |
| `note` | `TEXT` |

### `sections`

| Column | Definition |
|---|---|
| `id` | `INTEGER PRIMARY KEY AUTOINCREMENT` |
| `page_id` | `INTEGER NOT NULL REFERENCES pages(id) ON DELETE CASCADE` |
| `ordinal` | `INTEGER NOT NULL` |
| `heading` | `TEXT` |
| `level` | `INTEGER` |
| `anchor` | `TEXT` |
| `text` | `TEXT` |
| `word_count` | `INTEGER` |
| `content_hash` | `TEXT` |
| `updated_at` | `TEXT NOT NULL DEFAULT (datetime('now'))` |
| `UNIQUE` | `(page_id, ordinal)` |

### `geo_scores`

| Column | Definition |
|---|---|
| `id` | `INTEGER PRIMARY KEY AUTOINCREMENT` |
| `ts` | `TEXT NOT NULL DEFAULT (datetime('now'))` |
| `page_id` | `INTEGER REFERENCES pages(id) ON DELETE CASCADE` |
| `section_id` | `INTEGER REFERENCES sections(id) ON DELETE CASCADE` |
| `retrieval_probability` | `REAL NOT NULL` |
| `extractability` | `REAL NOT NULL` |
| `entity_reinforcement` | `REAL NOT NULL` |
| `structural_authority` | `REAL NOT NULL` |
| `system_memory` | `REAL NOT NULL` |
| `overall` | `REAL NOT NULL` |
| `detail` | `TEXT` |
| `run_id` | `INTEGER` |

### `queries`

| Column | Definition |
|---|---|
| `id` | `INTEGER PRIMARY KEY AUTOINCREMENT` |
| `text` | `TEXT NOT NULL` |
| `family` | `TEXT NOT NULL` |
| `city` | `TEXT` |
| `service` | `TEXT` |
| `intent` | `TEXT NOT NULL DEFAULT 'discovery'` |
| `priority` | `INTEGER NOT NULL DEFAULT 3` |
| `active` | `INTEGER NOT NULL DEFAULT 1` |
| `created_at` | `TEXT NOT NULL DEFAULT (datetime('now'))` |
| `UNIQUE` | `(text)` |

### `visibility_runs`

| Column | Definition |
|---|---|
| `id` | `INTEGER PRIMARY KEY AUTOINCREMENT` |
| `ts` | `TEXT NOT NULL DEFAULT (datetime('now'))` |
| `trigger` | `TEXT NOT NULL DEFAULT 'manual'` |
| `provider` | `TEXT NOT NULL` |
| `test_type` | `TEXT NOT NULL` |
| `queries_total` | `INTEGER NOT NULL DEFAULT 0` |
| `queries_ok` | `INTEGER NOT NULL DEFAULT 0` |
| `note` | `TEXT` |

### `visibility_results`

| Column | Definition |
|---|---|
| `id` | `INTEGER PRIMARY KEY AUTOINCREMENT` |
| `run_id` | `INTEGER REFERENCES visibility_runs(id) ON DELETE CASCADE` |
| `ts` | `TEXT NOT NULL DEFAULT (datetime('now'))` |
| `query_id` | `INTEGER REFERENCES queries(id)` |
| `query` | `TEXT NOT NULL` |
| `platform` | `TEXT NOT NULL` |
| `test_type` | `TEXT NOT NULL` |
| `status` | `TEXT NOT NULL` |
| `rank` | `INTEGER` |
| `answer` | `TEXT` |
| `cited_urls` | `TEXT` |
| `competitors` | `TEXT` |
| `city` | `TEXT` |
| `service` | `TEXT` |
| `confidence` | `TEXT` |
| `note` | `TEXT` |

### `competitors`

| Column | Definition |
|---|---|
| `id` | `INTEGER PRIMARY KEY AUTOINCREMENT` |
| `domain` | `TEXT NOT NULL UNIQUE` |
| `name` | `TEXT` |
| `tier` | `TEXT` |
| `home_city` | `TEXT` |
| `notes` | `TEXT` |
| `created_at` | `TEXT NOT NULL DEFAULT (datetime('now'))` |

### `competitor_observations`

| Column | Definition |
|---|---|
| `id` | `INTEGER PRIMARY KEY AUTOINCREMENT` |
| `ts` | `TEXT NOT NULL DEFAULT (datetime('now'))` |
| `competitor_id` | `INTEGER REFERENCES competitors(id) ON DELETE CASCADE` |
| `domain` | `TEXT NOT NULL` |
| `platform` | `TEXT NOT NULL` |
| `query` | `TEXT` |
| `appeared` | `INTEGER NOT NULL DEFAULT 0` |
| `rank` | `INTEGER` |
| `observed_feature` | `TEXT` |
| `confidence` | `TEXT` |
| `source` | `TEXT` |

### `entity_checks`

| Column | Definition |
|---|---|
| `id` | `INTEGER PRIMARY KEY AUTOINCREMENT` |
| `ts` | `TEXT NOT NULL DEFAULT (datetime('now'))` |
| `host` | `TEXT NOT NULL` |
| `url` | `TEXT` |
| `verdict` | `TEXT` |
| `http_status` | `INTEGER` |
| `canonical` | `TEXT` |
| `robots` | `TEXT` |
| `title` | `TEXT` |
| `is_owned` | `INTEGER DEFAULT 0` |
| `discrepancy` | `TEXT` |

### `entity_facts`

| Column | Definition |
|---|---|
| `id` | `INTEGER PRIMARY KEY AUTOINCREMENT` |
| `ts` | `TEXT NOT NULL DEFAULT (datetime('now'))` |
| `source` | `TEXT NOT NULL` |
| `field` | `TEXT NOT NULL` |
| `value` | `TEXT` |
| `expected` | `TEXT` |
| `matches` | `INTEGER` |
| `note` | `TEXT` |

### `experiments`

| Column | Definition |
|---|---|
| `id` | `INTEGER PRIMARY KEY AUTOINCREMENT` |
| `code` | `TEXT NOT NULL UNIQUE` |
| `hypothesis` | `TEXT NOT NULL` |
| `target_url` | `TEXT` |
| `target_section` | `TEXT` |
| `baseline` | `TEXT` |
| `variables` | `TEXT` |
| `methodology` | `TEXT` |
| `start_date` | `TEXT` |
| `followup_dates` | `TEXT` |
| `result` | `TEXT` |
| `limitations` | `TEXT` |
| `conclusion` | `TEXT` |
| `evidence` | `TEXT` |
| `status` | `TEXT NOT NULL DEFAULT 'planned'` |
| `confidence` | `TEXT` |
| `created_at` | `TEXT NOT NULL DEFAULT (datetime('now'))` |

### `experiment_measurements`

| Column | Definition |
|---|---|
| `id` | `INTEGER PRIMARY KEY AUTOINCREMENT` |
| `experiment_id` | `INTEGER NOT NULL REFERENCES experiments(id) ON DELETE CASCADE` |
| `ts` | `TEXT NOT NULL DEFAULT (datetime('now'))` |
| `metric` | `TEXT NOT NULL` |
| `value` | `REAL` |
| `note` | `TEXT` |

### `opportunities`

| Column | Definition |
|---|---|
| `id` | `INTEGER PRIMARY KEY AUTOINCREMENT` |
| `ts` | `TEXT NOT NULL DEFAULT (datetime('now'))` |
| `title` | `TEXT NOT NULL` |
| `problem` | `TEXT NOT NULL` |
| `evidence` | `TEXT` |
| `url` | `TEXT` |
| `section` | `TEXT` |
| `geo_layer` | `TEXT` |
| `expected_benefit` | `TEXT` |
| `difficulty` | `TEXT` |
| `impact` | `INTEGER` |
| `effort` | `INTEGER` |
| `priority` | `REAL` |
| `proposed` | `TEXT` |
| `status` | `TEXT NOT NULL DEFAULT 'open'` |
| `implemented_at` | `TEXT` |
| `result` | `TEXT` |
| `dedupe_key` | `TEXT UNIQUE` |

### `agent_runs`

| Column | Definition |
|---|---|
| `id` | `INTEGER PRIMARY KEY AUTOINCREMENT` |
| `ts` | `TEXT NOT NULL DEFAULT (datetime('now'))` |
| `finished_at` | `TEXT` |
| `agent` | `TEXT NOT NULL` |
| `orchestrator` | `TEXT` |
| `trigger` | `TEXT NOT NULL DEFAULT 'manual'` |
| `status` | `TEXT NOT NULL DEFAULT 'running'` |
| `summary` | `TEXT` |
| `detail` | `TEXT` |
| `error` | `TEXT` |
| `duration_ms` | `INTEGER` |

### `activity`

| Column | Definition |
|---|---|
| `id` | `INTEGER PRIMARY KEY AUTOINCREMENT` |
| `ts` | `TEXT NOT NULL DEFAULT (datetime('now'))` |
| `agent` | `TEXT NOT NULL` |
| `level` | `TEXT NOT NULL DEFAULT 'info'` |
| `message` | `TEXT NOT NULL` |
| `evidence` | `TEXT` |
| `run_id` | `INTEGER REFERENCES agent_runs(id) ON DELETE SET NULL` |

### `publications`

| Column | Definition |
|---|---|
| `id` | `INTEGER PRIMARY KEY AUTOINCREMENT` |
| `ts` | `TEXT NOT NULL DEFAULT (datetime('now'))` |
| `url` | `TEXT NOT NULL` |
| `change_type` | `TEXT NOT NULL` |
| `summary` | `TEXT NOT NULL` |
| `branch` | `TEXT` |
| `commit_sha` | `TEXT` |
| `pr_number` | `INTEGER` |
| `pr_url` | `TEXT` |
| `diff_stat` | `TEXT` |
| `before_hash` | `TEXT` |
| `after_hash` | `TEXT` |
| `validations` | `TEXT` |
| `status` | `TEXT NOT NULL DEFAULT 'pending'` |
| `verified_at` | `TEXT` |
| `rollback_of` | `INTEGER REFERENCES publications(id)` |
| `result` | `TEXT` |

### `integrations`

| Column | Definition |
|---|---|
| `id` | `INTEGER PRIMARY KEY AUTOINCREMENT` |
| `provider` | `TEXT NOT NULL UNIQUE` |
| `label` | `TEXT NOT NULL` |
| `category` | `TEXT NOT NULL` |
| `status` | `TEXT NOT NULL` |
| `last_sync` | `TEXT` |
| `last_error` | `TEXT` |
| `detail` | `TEXT` |
| `required_env` | `TEXT` |
| `updated_at` | `TEXT NOT NULL DEFAULT (datetime('now'))` |

### `reports`

| Column | Definition |
|---|---|
| `id` | `INTEGER PRIMARY KEY AUTOINCREMENT` |
| `ts` | `TEXT NOT NULL DEFAULT (datetime('now'))` |
| `period` | `TEXT NOT NULL` |
| `report_date` | `TEXT NOT NULL` |
| `title` | `TEXT NOT NULL` |
| `body` | `TEXT NOT NULL` |
| `source_run` | `INTEGER REFERENCES agent_runs(id) ON DELETE SET NULL` |
| `UNIQUE` | `(period, report_date)` |

### `cost_entries`

| Column | Definition |
|---|---|
| `id` | `INTEGER PRIMARY KEY AUTOINCREMENT` |
| `ts` | `TEXT NOT NULL DEFAULT (datetime('now'))` |
| `provider` | `TEXT NOT NULL` |
| `category` | `TEXT NOT NULL` |
| `units` | `REAL NOT NULL DEFAULT 0` |
| `unit_label` | `TEXT` |
| `est_usd` | `REAL NOT NULL DEFAULT 0` |
| `note` | `TEXT` |

### `tasks`

| Column | Definition |
|---|---|
| `id` | `INTEGER PRIMARY KEY AUTOINCREMENT` |
| `ts` | `TEXT NOT NULL DEFAULT (datetime('now'))` |
| `title` | `TEXT NOT NULL` |
| `agent` | `TEXT NOT NULL` |
| `priority` | `REAL NOT NULL DEFAULT 3` |
| `status` | `TEXT NOT NULL DEFAULT 'queued'` |
| `payload` | `TEXT` |
| `result` | `TEXT` |
| `run_id` | `INTEGER REFERENCES agent_runs(id) ON DELETE SET NULL` |
| `updated_at` | `TEXT NOT NULL DEFAULT (datetime('now'))` |

### `research_notes`

| Column | Definition |
|---|---|
| `id` | `INTEGER PRIMARY KEY AUTOINCREMENT` |
| `ts` | `TEXT NOT NULL DEFAULT (datetime('now'))` |
| `topic` | `TEXT NOT NULL` |
| `title` | `TEXT NOT NULL` |
| `body` | `TEXT NOT NULL` |
| `source` | `TEXT` |
| `tags` | `TEXT` |

### `citation_actions`

| Column | Definition |
|---|---|
| `id` | `INTEGER PRIMARY KEY AUTOINCREMENT` |
| `domain` | `TEXT NOT NULL UNIQUE` |
| `times_cited_when_we_lost` | `INTEGER NOT NULL DEFAULT 0` |
| `action` | `TEXT` |
| `status` | `TEXT NOT NULL DEFAULT 'todo'` |
| `engines` | `TEXT` |
| `example_urls` | `TEXT` |
| `updated_at` | `TEXT NOT NULL DEFAULT (datetime('now'))` |

### `technical_health_history`

| Column | Definition |
|---|---|
| `id` | `INTEGER PRIMARY KEY AUTOINCREMENT` |
| `ts` | `TEXT NOT NULL DEFAULT (datetime('now'))` |
| `checks` | `TEXT NOT NULL` |
