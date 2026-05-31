"use client";

import { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import type { LayoutItem } from "react-grid-layout";
import {
  MarketSummaryWidget,
  WatchlistWidget,
  AgentConsensusWidget,
  RadarPreviewWidget,
  PortfolioWidget,
  TopMoversWidget,
  DailyBriefingWidget,
  NewsFeedWidget,
  InvestorsWidget,
} from "./widgets";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/hooks/useLanguage";
import type { StockQuote, StockAnalysis, MarketIndex } from "@/types";
import type { DailyBriefing } from "@/lib/agents/types";
import type { NewsItem } from "@/lib/news/types";

const GridLayout = dynamic(
  () => import("react-grid-layout/legacy").then((m) => m.default),
  { ssr: false }
);

import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

const DEFAULT_LAYOUT: LayoutItem[] = [
  { i: "market", x: 0, y: 0, w: 3, h: 3, minW: 3, minH: 2 },
  { i: "portfolio", x: 3, y: 0, w: 3, h: 3, minW: 3, minH: 2 },
  { i: "news", x: 6, y: 0, w: 3, h: 5, minW: 3, minH: 3 },
  { i: "investors", x: 9, y: 0, w: 3, h: 3, minW: 3, minH: 2 },
  { i: "watchlist", x: 0, y: 3, w: 3, h: 5, minW: 3, minH: 3 },
  { i: "movers", x: 3, y: 3, w: 3, h: 4, minW: 3, minH: 3 },
  { i: "agents", x: 9, y: 3, w: 3, h: 4, minW: 3, minH: 3 },
  { i: "briefing", x: 3, y: 7, w: 3, h: 3, minW: 3, minH: 2 },
  { i: "radar", x: 6, y: 7, w: 3, h: 3, minW: 3, minH: 2 },
];

interface DashboardData {
  quotes: StockQuote[];
  indices: MarketIndex[];
  analyses: { quote: StockQuote; analysis: StockAnalysis }[];
  radarCount: number;
  briefing: DailyBriefing;
  news: NewsItem[];
  investors: Array<{ id: string; name: string; firm: string; topSymbol: string | null }>;
  portfolio: {
    totalValue: number;
    unrealizedPnL: number;
    unrealizedPnLPercent: number;
    totalPnL?: number;
  };
}

export function DashboardGrid({ data }: { data: DashboardData }) {
  const { t } = useLanguage();
  const [layout, setLayout] = useState<LayoutItem[]>(DEFAULT_LAYOUT);
  const [editMode, setEditMode] = useState(false);
  const [width, setWidth] = useState(1200);

  useEffect(() => {
    const saved = localStorage.getItem("traderpro-layout");
    if (saved) {
      try {
        setLayout(JSON.parse(saved));
      } catch {
        /* ignore */
      }
    }
    const updateWidth = () => {
      const el = document.getElementById("dashboard-grid-container");
      if (el) setWidth(el.offsetWidth);
    };
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  const saveLayout = useCallback(() => {
    localStorage.setItem("traderpro-layout", JSON.stringify(layout));
    setEditMode(false);
  }, [layout]);

  const resetLayout = useCallback(() => {
    setLayout(DEFAULT_LAYOUT);
    localStorage.removeItem("traderpro-layout");
  }, []);

  const widgets: Record<string, React.ReactNode> = {
    market: <MarketSummaryWidget indices={data.indices} />,
    portfolio: (
      <PortfolioWidget
        totalValue={data.portfolio.totalValue}
        unrealizedPnL={data.portfolio.unrealizedPnL}
        unrealizedPnLPercent={data.portfolio.unrealizedPnLPercent}
        totalPnL={data.portfolio.totalPnL}
      />
    ),
    watchlist: <WatchlistWidget quotes={data.quotes} />,
    movers: <TopMoversWidget quotes={data.quotes} />,
    agents: <AgentConsensusWidget analyses={data.analyses} />,
    briefing: <DailyBriefingWidget briefing={data.briefing} />,
    radar: <RadarPreviewWidget matchCount={data.radarCount} />,
    news: <NewsFeedWidget news={data.news} />,
    investors: <InvestorsWidget investors={data.investors} />,
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t.dashboard.title}</h1>
        <div className="flex gap-2">
          {editMode ? (
            <>
              <button
                onClick={saveLayout}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white"
              >
                {t.dashboard.saveLayout}
              </button>
              <button
                onClick={resetLayout}
                className="rounded-lg border border-zinc-300 px-4 py-2 text-sm dark:border-zinc-700"
              >
                {t.dashboard.resetLayout}
              </button>
            </>
          ) : (
            <button
              onClick={() => setEditMode(true)}
              className="rounded-lg border border-zinc-300 px-4 py-2 text-sm dark:border-zinc-700"
            >
              {t.dashboard.editWidgets}
            </button>
          )}
        </div>
      </div>

      <div id="dashboard-grid-container" className="w-full">
        <GridLayout
          className="layout"
          layout={layout}
          cols={12}
          rowHeight={60}
          width={width}
          isDraggable={editMode}
          isResizable={editMode}
          onLayoutChange={(l) => editMode && setLayout([...l])}
          draggableHandle=".widget-drag-handle"
        >
          {layout.map((item) => (
            <div key={item.i} className="overflow-hidden rounded-xl">
              {editMode && (
                <div className="widget-drag-handle cursor-move bg-zinc-200 px-2 py-1 text-xs dark:bg-zinc-800">
                  ⋮⋮ {item.i}
                </div>
              )}
              {widgets[item.i]}
            </div>
          ))}
        </GridLayout>
      </div>
    </div>
  );
}
