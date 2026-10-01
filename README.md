# Sind & Sind

Sind & Sind is an operational intelligence and decision-support platform for e-commerce and retail brands. It replaces disconnected spreadsheet analysis and surface-level dashboards with a unified commerce operating model that tracks how pricing decisions, marketplace take-rates, fulfillment operations, and working capital commitments interact to determine true net contribution and cash flow.

The project combines deterministic mathematical calculation engines, canonical data normalization across multiple sources (Shopify, Amazon Seller Central, Amazon Vendor Central, CSV imports), and a tool-using AI Commerce Operating Agent that conducts multi-step analytical investigations over verified ledger data.

---

## System Architecture

```
                                  [ Commerce Data Sources ]
                  Shopify D2C  ·  Amazon SP-API (3P/1P)  ·  CSV / ERP Ingestion
                                              │
                                              ▼
                                 [ Canonical Data Layer ]
                    DataContext · Strict Mode Isolation (EMPTY / DEMO / IMPORTED / CONNECTED)
                                              │
                    ┌─────────────────────────┴─────────────────────────┐
                    ▼                                                   ▼
     [ Deterministic Economics Engines ]                 [ Commerce Operating Agent ]
      · Store & SKU Waterfall Economics                   · Investigation Planner (7 Intent Pipelines)
      · Pricing Floor & Elasticity Sensitivity            · 15 Read-Only Tool Registry
      · Marketplace Take-Rates (DTC / FBA / MFN)          · Grounded Evidence Package (Provenance Tags)
      · Warehouse Capacity & Lane Transit SLAs            · Backend LLM Provider (OpenAI/Gemini/Claude)
      · 7-Stage Capital Flow & Cash Exposure              · Deterministic Review Synthesis Fallback
      · Cross-Functional Signal Rule Engine               · Prompt Injection Defense (<untrusted_telemetry>)
                    │                                                   │
                    └─────────────────────────┬─────────────────────────┘
                                              ▼
                             [ Operating Console & UI Layer ]
         Executive Command  ·  Products & SKU Dossiers  ·  Economics  ·  Pricing
     Marketplaces  ·  Operations  ·  Cash & Float  ·  Signals & Decisions  ·  Data Hub
```

---

## Core Capabilities

### 1. Deterministic Commerce Operating Model (`src/lib/economics.js`)
Calculations are executed deterministically through mathematical engines rather than generative estimates:
- **Unit Waterfall Decomposition**: Maps list price $\rightarrow$ promotional discounts $\rightarrow$ realized ASP $\rightarrow$ landed COGS $\rightarrow$ platform/payment take-rates $\rightarrow$ forward logistics & packaging $\rightarrow$ media CAC $\rightarrow$ customer return friction $\rightarrow$ true contribution.
- **Pricing Floor & Headroom Engine**: Calculates the required realized price floor per SKU to preserve target contribution thresholds (e.g. 25%) across different channels, computing remaining discount headroom and sensitivity across $-5\%$ to $+5\%$ price shift scenarios.
- **Cross-Channel Marketplace Economics**: Itemizes commission fees, FBA fulfillment charges, payment gateways, and storage surcharges across Shopify D2C, Amazon FBA, Amazon MFN, and Myntra/Ajio.
- **Fulfillment & Operations Economics**: Tracks multi-facility warehouse storage capacity utilization, processing throughput, shipping corridor SLAs (transit days vs benchmark), and fulfillment-driven return rate correlations.
- **Working Capital & Cash Flow Lifecycle**: Models the 7-stage capital cycle (Purchase Order commitments $\rightarrow$ supplier credit float $\rightarrow$ warehouse inventory locked at cost $\rightarrow$ customer delivery $\rightarrow$ marketplace settlement float $\rightarrow$ return refund friction $\rightarrow$ realized cash).

### 2. Autonomous Commerce Operating Agent (`server/agent/`)
An investigation agent designed to analyze merchant performance data:
- **Investigation Planner (`investigationPlanner.js`)**: Classifies user queries into 7 distinct investigation pipelines (`CONTRIBUTION_INVESTIGATION`, `WORKING_CAPITAL_INVESTIGATION`, `PRICING_INVESTIGATION`, `MARKETPLACE_INVESTIGATION`, `OPERATIONS_RETURN_INVESTIGATION`, `SKU_DIAGNOSTIC`, `FULL_OPERATING_REVIEW`) and dynamically sequences multi-step tool calls where subsequent steps depend on earlier tool findings.
- **15 Controlled Read-Only Tools (`toolRegistry.js`)**: Pure mathematical tools across commercial, pricing, marketplace, operations, cash, findings, and diagnostic domains. All tools are strictly read-only and operate on the active dataset without mutating state.
- **Backend LLM Provider Abstraction (`server/agent/provider/llmProvider.js`)**: Multi-provider layer supporting OpenAI (`gpt-4o`, `gpt-4o-mini`), Google Gemini (`gemini-1.5-pro`, `gemini-1.5-flash`), and Anthropic (`claude-3-5-sonnet`) with automatic fallback to deterministic synthesis when no API key is configured.
- **Prompt Injection Defense**: Merchant business data (SKU names, descriptions, user inputs) is isolated inside `<untrusted_commerce_telemetry>` delimiters with strict system prompt boundaries.
- **Oliver Wyman 7-Section Review**: Formats diagnostic findings into an executive consulting structure:
  1. `01 / Executive Finding`: Declarative diagnostic summary.
  2. `02 / Grounded Evidence & Telemetry`: Verified metric cards with provenance tags.
  3. `03 / Root Cause Diagnosis`: Structural causal explanation.
  4. `04 / Economic & Cash Implication`: Quantified margin impact and cash drag.
  5. `05 / Strategic Management Levers`: Numbered tactical operating actions.
  6. `06 / Model Assumptions & Sensitivities`: Model disclosures and parameter dependencies.
  7. `07 / Data Basis & Monitored Scope`: Dataset state, catalog scope, and evaluation window.
- **Diagnostic Trace Audit**: Renders an interactive telemetry drawer displaying executed tool steps, execution durations in milliseconds, step status, and result summaries.

### 3. Canonical Data Model & Strict State Isolation (`src/context/DataContext.jsx`)
Guarantees analytical integrity by isolating 4 operating data states:
- `EMPTY`: Renders dedicated empty states and onboarding workflows with zero fabricated metrics.
- `DEMO`: Uses the baseline synthetic dataset (*Atelier & Co.*) with explicit `[Configured Demo Assumption]` provenance tagging.
- `IMPORTED`: Ingests user-supplied CSV files with automated column auto-mapping, schema validation, and reconciliation.
- `CONNECTED`: Integrates authorized Amazon SP-API / Shopify streams with `[Observed Data]` provenance.

### 4. Marketplace Integration Architecture (`server/marketplace/`)
Production-grade integration patterns for Amazon Selling Partner API (SP-API) and Vendor Central:
- **Security & Authorization (`security/OAuthManager.js`)**: Login with Amazon (LWA) OAuth 2.0 PKCE flow with cryptographically random CSRF state tokens.
- **Audit Logging (`security/AuditLogger.js`)**: Structured operational audit logging with automatic redaction of access tokens, client secrets, and PII.
- **Resilience (`resilience/RateLimitManager.js`, `resilience/RetryPolicy.js`)**: Token-bucket rate limiting matching SP-API burst quotas and exponential backoff retry with full jitter on 429/503 responses.
- **Pipeline & Normalization (`pipeline/`)**: Schema validation (`RawIngestionValidator.js`), canonical model normalization for 3P Seller Central orders and 1P Vendor Central purchase orders (`AmazonDataNormalizer.js`), and settlement/inventory reconciliation (`DataReconciliationEngine.js`).

---

## Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend Framework** | React 19, React Router v7 |
| **Build Tooling & Dev Server** | Vite 7 |
| **Styling & Design System** | Tailwind CSS v4 |
| **Backend Framework** | Node.js (ES Modules), Express 5 |
| **Testing** | Node.js Native Test Runner (`node --test`) |
| **AI / LLM Integration** | Backend abstraction supporting OpenAI, Google Gemini, Anthropic, or local deterministic synthesis |
| **Data Format** | JSON, Canonical Commerce Schema, CSV Parsing |

---

## Repository Structure

```
sindandsind/
├── server/
│   ├── index.js                           # Express server entrypoint (ports 5174 / $PORT)
│   ├── agent/
│   │   ├── agentRouter.js                 # API route handler: POST /api/agent/investigate
│   │   ├── agentService.js                # Orchestration, prompt injection defense, synthesis
│   │   ├── evidenceService.js             # Evidence packaging, formatting, and provenance tags
│   │   ├── investigationPlanner.js        # Multi-step investigation planner & intent routing
│   │   ├── toolRegistry.js                # 15 controlled read-only mathematical tools
│   │   └── provider/
│   │       └── llmProvider.js             # Multi-provider LLM abstraction (OpenAI/Gemini/Claude)
│   ├── marketplace/
│   │   ├── models/tenantModels.js          # Marketplace connection schemas & tenant state
│   │   ├── pipeline/                      # Ingestion validator, SP-API normalizer, reconciliation
│   │   ├── providers/                     # SP-API, Seller Central, and Vendor Central adapters
│   │   ├── resilience/                    # Token-bucket rate limiter and retry policy with jitter
│   │   ├── security/                      # LWA OAuth 2.0 PKCE manager & secret-redacting audit logger
│   │   └── store/MarketplaceStore.js      # In-memory tenant store with persistence hooks
│   └── routes/
│       └── marketplaceRoutes.js           # Marketplace connection, sync, and OAuth routes
├── src/
│   ├── main.jsx                           # Application entrypoint
│   ├── App.jsx                            # Route tree with ErrorBoundary & DataProvider
│   ├── styles.css                         # Global CSS & Tailwind imports
│   ├── agent/
│   │   ├── agentClient.js                 # Browser-safe HTTP client for agent API
│   │   └── useAgent.js                    # React hook managing investigation state & execution
│   ├── components/
│   │   ├── ErrorBoundary.jsx              # Global analytical error boundary & recovery UI
│   │   ├── Header.jsx / Footer.jsx        # Editorial site navigation
│   │   └── app/                           # Operating Console UI components
│   │       ├── AppNav.jsx                 # Top bar & navigation with home control
│   │       ├── AppShell.jsx               # Operating console layout with persistent nav
│   │       ├── DataSourceBar.jsx          # Live data state indicator & provenance badge
│   │       ├── EmptyState.jsx             # Clean zero-data placeholder
│   │       ├── OnboardingScreen.jsx       # CSV import & marketplace connection wizard
│   │       └── TrendChart.jsx             # Metric sparklines & trend visualizations
│   ├── context/
│   │   └── DataContext.jsx                # Global commerce dataset state & mode switching
│   ├── data/
│   │   └── demoStore.js                   # Atelier & Co. baseline demo dataset
│   ├── hooks/
│   │   └── useCommerceData.js             # Hook exposing active dataset, mode, and summary stats
│   ├── lib/
│   │   ├── economics.js                   # Unit economics, waterfalls, warehouses, capital lifecycle
│   │   ├── economicRules.js               # Channel configs, pricing thresholds, marketplace fee rules
│   │   ├── metrics.js                     # Catalog aggregation, product ranking, SKU summaries
│   │   ├── signals.js                     # Cross-functional signal generator
│   │   ├── signalRules.js                 # Anomaly detection rules across margin, CAC, and stockouts
│   │   ├── csvImporter.js                 # CSV parser, column auto-mapping, and TEST-001 dataset
│   │   └── marketplace/                   # Canonical schema models & marketplace constants
│   └── pages/
│       ├── Home.jsx                       # Editorial public homepage
│       ├── Expertise.jsx / Insights.jsx   # Editorial research & advisory pages
│       └── app/                           # Operating Console Pages
│           ├── OverviewPage.jsx           # Command overview, key metrics, and priority signals
│           ├── ProductsPage.jsx           # Commercial register with SKU waterfall rankings
│           ├── ProductDetailPage.jsx      # SKU deep-dive: unit waterfall, channel fit, sensitivity
│           ├── EconomicsPage.jsx          # Store economics, cost-to-serve decomposition
│           ├── PricingPage.jsx            # Realized pricing floors, discount headroom
│           ├── MarketplacesPage.jsx       # Cross-channel fee comparison & take-rates
│           ├── OperationsPage.jsx         # Warehouse utilization, carrier SLAs, return friction
│           ├── WorkingCapitalPage.jsx     # 7-stage capital flow, cash float, supplier float
│           ├── SignalsPage.jsx            # Operational anomalies & diagnostic signals
│           ├── DecisionsPage.jsx          # Action items, management levers, and decision ledger
│           ├── DataPage.jsx               # Data Hub: CSV ingestion, Amazon SP-API authorization
│           ├── SettingsPage.jsx           # Merchant configuration & threshold parameters
│           └── AgentPage.jsx              # AI Operating Agent with live trace & Oliver Wyman dossier
└── package.json                           # Scripts, dependencies, and project metadata
```

---

## Getting Started

### Prerequisites
- Node.js 20+ (ES Modules enabled)
- npm 10+

### Installation
```bash
git clone https://github.com/your-username/sindandsind.git
cd sindandsind
npm install
```

### Running Locally
To run both the Vite frontend (`port 5173`) and Express backend (`port 5174`) concurrently:
```bash
npm run dev
```

Alternatively, run them in separate terminals:
```bash
# Terminal 1: Backend API
npm run dev:server

# Terminal 2: Frontend Client
npm run dev:client
```

Open `http://localhost:5173` in your browser.

---

## Environment Configuration

The application is fully functional out of the box in **Deterministic Engine Mode** without requiring any external API keys.

To enable live LLM reasoning for the Commerce Operating Agent, set provider credentials in your server environment:

```env
# Optional LLM Configuration (Backend Only — Never exposed to browser)
LLM_PROVIDER=openai              # openai | gemini | anthropic
LLM_MODEL=gpt-4o-mini            # Model identifier
OPENAI_API_KEY=sk-...            # OpenAI API Key
# GEMINI_API_KEY=...             # Google Gemini API Key
# ANTHROPIC_API_KEY=...          # Anthropic API Key
LLM_TIMEOUT_MS=25000             # Request timeout in milliseconds

# Optional Server Configuration
PORT=5174                        # Express server port
CLIENT_ORIGIN=http://localhost:5173
```

---

## Testing & Verification

The test suite runs using the Node.js native test runner (`node --test`), verifying deterministic calculations, marketplace resilience, rate limiting, data isolation, and agent multi-step planning:

```bash
# Run all unit and integration tests
npm test

# Run individual test suites
node --test src/lib/economics.test.js
node --test src/lib/pricingEconomics.test.js
node --test src/lib/workingCapital.test.js
node --test src/lib/operations.test.js
node --test src/lib/marketplaceEconomics.test.js
node --test src/lib/marketplace/marketplace.test.js
node --test src/lib/agentArchitecture.test.js
node --test src/lib/agentEndToEndValidation.test.js
```

### Production Build
```bash
npm run build
npm start
```

---

## Key Operating Console Routes

| Route | Purpose |
| :--- | :--- |
| `/` | Public editorial overview and advisory capabilities |
| `/app` | Executive Command: top-line revenue, true contribution, cash exposure, and active signals |
| `/app/products` | Commercial Products register with unit contribution ranking |
| `/app/products/:sku` | SKU unit waterfall, landed cost breakdown, and channel fee comparison |
| `/app/economics` | Store-level economics, cost-to-serve decomposition, and profit waterfalls |
| `/app/pricing` | Required realized price floors, discount headroom, and elasticity sensitivity |
| `/app/marketplaces` | Channel fee comparison (Shopify D2C vs Amazon FBA vs Amazon MFN vs Myntra) |
| `/app/operations` | Warehouse capacity utilization, courier transit SLAs, and return correlations |
| `/app/cash` | 7-stage working capital lifecycle, inventory capital locked, and cash float |
| `/app/signals` | Rule-based operational anomaly detections across margin, CAC, and stockouts |
| `/app/decisions` | Management action items and decision ledger |
| `/app/data` | Data Hub: Mode switching (Demo/Empty/Imported), CSV upload, Amazon SP-API connection |
| `/app/agent` | Autonomous Commerce Operating Agent with diagnostic trace and 7-section review |

---

## License

This project is private and proprietary. All rights reserved.
