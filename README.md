# TraderPro

Professional US stock dashboard with multi-agent insights, widget layout, screening radar, and mock portfolio trading. IBKR integration planned for Phase 2.

## Stack

- **Frontend:** Next.js 16, React 19, Tailwind CSS 4
- **Widgets:** react-grid-layout
- **Charts:** Recharts
- **Market data:** yahoo-finance2 (with mock fallback)
- **Broker (MVP):** MockBroker — IBKR adapter coming later

## Default Watchlist (Top 10 by Market Cap)

| Symbol | Company | Exchange |
|--------|---------|----------|
| NVDA | NVIDIA | NASDAQ |
| GOOGL | Alphabet | NASDAQ |
| AAPL | Apple | NASDAQ |
| MSFT | Microsoft | NASDAQ |
| AMZN | Amazon | NASDAQ |
| TSM | Taiwan Semiconductor | NYSE |
| AVGO | Broadcom | NASDAQ |
| TSLA | Tesla | NASDAQ |
| META | Meta | NASDAQ |
| MU | Micron | NASDAQ |

## Getting Started

```bash
cd apps/web
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Pages

| Route | Description |
|-------|-------------|
| `/` | Widget dashboard |
| `/watchlist` | Full watchlist table |
| `/radar` | Screening radar with filters |
| `/portfolio` | Mock portfolio, allocation, simulated orders |
| `/performance` | P/L charts, SPY benchmark, trade journal, CSV |
| `/stock/[symbol]` | Stock detail + agent insights |
| `/agents` | Multi-agent hub, weights, briefing, accuracy |
| `/settings` | Language (TR/EN), theme, broker status |

## API Routes

- `GET /api/stocks` — watchlist quotes + market indices
- `GET /api/stocks/[symbol]` — quote + agent analysis
- `GET/POST /api/radar` — screening scan
- `GET/POST /api/portfolio` — mock portfolio & orders
- `GET/POST /api/agents` — multi-agent analysis, weights, briefing
- `GET /api/performance` — P/L report

## Multi-Agent System

| Agent | Role |
|-------|------|
| **Fundamental** | P/E, ROE, valuation |
| **Technical** | Momentum, 52w levels |
| **Regime** | SPY risk-on/off, sector |
| **Risk** | Veto, position size cap |
| **Coordinator** | Weighted consensus + conflicts |

Configure weights at `/agents`. Predictions stored in `apps/web/data/`.

## Project Structure

```
TraderPro/
├── apps/
│   └── web/                 # Next.js dashboard
│       └── src/
│           ├── app/         # Pages + API routes
│           ├── components/  # UI, dashboard, layout
│           ├── hooks/       # i18n, language
│           ├── lib/         # market-data, broker, i18n
│           └── types/
└── README.md
```

## Roadmap

- [x] Phase 0: Project skeleton, 10-stock watchlist, mock API
- [x] Phase 1: Widget dashboard + watchlist + radar
- [x] Phase 2: P/L analysis, benchmark vs SPY, trade journal, CSV export
- [x] Phase 3: Multi-agent engine, coordinator, daily briefing, accuracy tracking
- [ ] Phase 4: IBKR Client Portal API adapter
- [ ] Phase 5: Live trading with risk controls

## Language

Settings → Türkçe / English / Both (bilingual agent summaries)
