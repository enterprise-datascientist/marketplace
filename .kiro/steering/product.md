---
inclusion: always
---

# Product: MAS Enterprise Data Marketplace

A single-page web app simulating an internal enterprise data marketplace for the Monetary Authority of Singapore. Users browse financial datasets, submit access requests, view analytics, receive intelligence alerts, and monitor compliance — all governed by Apache Ranger policies.

## Roles

Two roles toggled in-browser (no auth backend):
- `Analyst` — browse catalog, request access, view My Data with charts, use AI Agent, submit requests
- `DivHead` — approve/reject requests, view Risk & Compliance dashboard, Activity Log, Access Report, Adoption metrics

## Views & Navigation

### Analyst tabs (in order):
| Tab | View ID | Description |
|---|---|---|
| Catalog | `catalog` | Two-level: category tiles → dataset cards. Categories: Market Data, Credit Ratings, Trade Data, Exchange Data, Research Data, Regulatory Data, Supervision |
| My Data | `mydata` | Paginated (1 dataset/page). Tables tab shows data + analytics charts (OTC, SGX, ACRA, MAS FX, Supervision). Policies tab shows Ranger policies |
| Actions | `actions` | Two-level: category tiles (AML, Market Integrity, Financial Stability, Monetary Policy, Prudential, Credit Risk, Market Outlook, Statistical Bulletin, Enforcement) → alert cards with predictions |
| Central Bank Feeds | `cbfeed` | Two-level: region tiles (ASEAN, Americas, Europe, Asia Pacific) → news cards with impact badges and Read More links |
| Data Discovery | `flow` | Visual process flow diagram + lifecycle stage explanations |
| My Requests | `requests` | Table of user's submitted requests |
| AI Agent | `aichat` | Natural language chat interface for querying business data with SQL translation |

### DivHead tabs (in order):
| Tab | View ID | Description |
|---|---|---|
| Catalog | `catalog` | Same as Analyst |
| Actions | `actions` | Same as Analyst |
| Central Bank Feeds | `cbfeed` | Same as Analyst |
| Risk & Compliance | `risk` | Three sub-tabs: Dashboard (scorecard, risk flags, charts), Activity Log, Access Report |
| Adoption | `adoption` | Platform metrics with 6 trend charts (users, datasets, requests, policies, alerts, dashboard views) |
| Data Discovery | `flow` | Same as Analyst |
| Approvals | `approvals` | Approve/reject requests with comments and email attachment upload |

## Datasets (11 total)

| ID | Provider | Category | Tier |
|---|---|---|---|
| `otc-derivatives` | DTCC | Trade Data | Restricted |
| `sgx-trade` | SGX | Trade Data | Premium |
| `acra-corporate` | ACRA | Regulatory Data | Restricted |
| `mas-exchange-rates` | MAS | Market Data | Standard |
| `mas-supervision` | MAS | Supervision | Restricted |
| `mas610` | MAS | Regulatory Data | Restricted |
| `bloomberg-terminal` | Bloomberg | Market Data | Premium |
| `fitch-ratings` | Fitch | Credit Ratings | Standard |
| `moodys-analytics` | Moody's | Credit Ratings | Standard |
| `sp-global` | S&P Global | Market Data | Premium |
| `refinitiv-eikon` | Refinitiv | Market Data | Premium |
| `ice-data` | ICE | Exchange Data | Standard |
| `factset` | FactSet | Research Data | Standard |

## Key Features

- Login page: split-screen with product tour carousel + avatar quick-login
- Dataset detail drawer with 3 tabs: Overview, Business Definitions, Request Access
- OTC/SGX/ACRA/MAS FX/Supervision datasets have dark-themed FSR analytics charts with detailed explanations
- My Data pagination: one dataset per page, custom sort order
- Risk & Compliance: compliance scorecard (6 scored controls), risk flags, department/tier/access-type charts
- Actions: 8 intelligence categories with cross-dataset alerts, market predictions, and recommended actions
- Central Bank Feeds: 10 central banks grouped by 4 geographic regions with LIVE indicator
- AI Agent: simulated NLP → SQL → data table responses
- Adoption: 6 month-over-month trend charts
- Approval workflow: comment + email attachment upload
- Provisioning animation: 8-step Ranger policy creation overlay
