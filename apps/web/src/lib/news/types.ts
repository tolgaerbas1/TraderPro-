export type NewsSentiment = "positive" | "negative" | "neutral";

export interface NewsItem {
  id: string;
  symbol: string;
  titleEn: string;
  titleTr: string;
  source: string;
  url: string;
  publishedAt: string;
  sentiment: NewsSentiment;
  impactScore: number;
  keywords: string[];
}
