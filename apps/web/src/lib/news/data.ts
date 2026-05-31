import type { NewsItem, NewsSentiment } from "./types";

const SYMBOLS = ["NVDA", "AAPL", "MSFT", "AMZN", "META", "TSLA", "GOOGL", "AVGO", "TSM", "MU"];

const EVENTS: Array<{
  titleEn: string;
  titleTr: string;
  sentiment: NewsSentiment;
  impact: number;
  keywords: string[];
}> = [
  { titleEn: "NVIDIA unveils next-gen Blackwell Ultra GPU, shares surge", titleTr: "NVIDIA yeni nesil Blackwell Ultra GPU'yu tanıttı, hisseler yükseldi", sentiment: "positive", impact: 0.85, keywords: ["gpu", "AI", "product launch", "earnings"] },
  { titleEn: "Apple reports record services revenue, beats estimates", titleTr: "Apple rekor servis geliri açıkladı, beklentileri aştı", sentiment: "positive", impact: 0.72, keywords: ["earnings", "revenue", "services"] },
  { titleEn: "Microsoft expands AI Copilot across Office suite", titleTr: "Microsoft AI Copilot'ı Office paketine genişletiyor", sentiment: "positive", impact: 0.68, keywords: ["AI", "product", "cloud"] },
  { titleEn: "Amazon cloud growth accelerates, AWS revenue up 19%", titleTr: "Amazon bulut büyümesi hızlandı, AWS geliri %19 arttı", sentiment: "positive", impact: 0.74, keywords: ["cloud", "earnings", "revenue"] },
  { titleEn: "Meta ad revenue beats expectations on AI targeting", titleTr: "Meta reklam geliri AI hedefleme sayesinde beklentiyi aştı", sentiment: "positive", impact: 0.65, keywords: ["advertising", "AI", "earnings"] },
  { titleEn: "Tesla faces NHTSA investigation over Autopilot safety", titleTr: "Tesla Autopilot güvenliği nedeniyle NHTSA soruşturmasıyla karşı karşıya", sentiment: "negative", impact: -0.71, keywords: ["investigation", "regulation", "safety"] },
  { titleEn: "Broadcom raises dividend by 12%, strong chip demand", titleTr: "Broadcom temettüyü %12 artırdı, güçlü çip talebi", sentiment: "positive", impact: 0.55, keywords: ["dividend", "semiconductor"] },
  { titleEn: "TSMC Arizona plant reaches 4nm production milestone", titleTr: "TSMC Arizona tesisi 4nm üretim kilometre taşına ulaştı", sentiment: "positive", impact: 0.62, keywords: ["semiconductor", "production", "expansion"] },
  { titleEn: "Micron cuts Q3 guidance on weak memory demand", titleTr: "Micron zayıf bellek talebi nedeniyle Q3 öngörüsünü düşürdü", sentiment: "negative", impact: -0.66, keywords: ["guidance", "earnings", "semiconductor"] },
  { titleEn: "Google's DeepMind breakthrough in protein folding AI", titleTr: "Google DeepMind protein katlama AI'da çığır açtı", sentiment: "positive", impact: 0.48, keywords: ["AI", "research"] },
  { titleEn: "Apple faces EU antitrust fine over App Store rules", titleTr: "Apple App Store kuralları nedeniyle AB antitröst cezasıyla karşı karşıya", sentiment: "negative", impact: -0.58, keywords: ["regulation", "antitrust", "EU"] },
  { titleEn: "NVIDIA signs major cloud deals with Oracle and AWS", titleTr: "NVIDIA Oracle ve AWS ile büyük bulut anlaşmaları imzaladı", sentiment: "positive", impact: 0.76, keywords: ["cloud", "partnership", "GPU"] },
  { titleEn: "Microsoft's $3B India AI investment announced", titleTr: "Microsoft Hindistan'a $3B AI yatırımı açıkladı", sentiment: "positive", impact: 0.52, keywords: ["AI", "investment", "expansion"] },
  { titleEn: "Tesla cuts prices again in Europe amid competition", titleTr: "Tesla rekabet ortamında Avrupa'da fiyatları tekrar düşürdü", sentiment: "negative", impact: -0.48, keywords: ["pricing", "competition", "EV"] },
  { titleEn: "Meta to acquire AI startup for $1.2B", titleTr: "Meta $1.2B'ye AI girişimi satın alıyor", sentiment: "positive", impact: 0.58, keywords: ["acquisition", "AI"] },
  { titleEn: "AMZN labor union vote looms at Kentucky warehouse", titleTr: "AMZN işçi sendikası oylaması Kentucky deposunda yaklaşıyor", sentiment: "negative", impact: -0.35, keywords: ["labor", "union"] },
  { titleEn: "TSMC reports 38% YoY revenue growth in Q1", titleTr: "TSMC Q1'de yıllık %38 gelir artışı bildirdi", sentiment: "positive", impact: 0.78, keywords: ["earnings", "revenue", "semiconductor"] },
  { titleEn: "Wall Street analyst upgrades AVGO to Strong Buy", titleTr: "Wall Street analisti AVGO'yu Güçlü Al'a yükseltti", sentiment: "positive", impact: 0.42, keywords: ["analyst", "upgrade"] },
  { titleEn: "MU faces chip export restrictions to China", titleTr: "MU Çin'e çip ihracat kısıtlamalarıyla karşı karşıya", sentiment: "negative", impact: -0.62, keywords: ["export", "regulation", "China"] },
  { titleEn: "NVDA stock split speculation drives retail interest", titleTr: "NVDA hisse bölünmesi spekülasyonu perakende ilgiyi artırdı", sentiment: "positive", impact: 0.38, keywords: ["stock split", "retail"] },
];

function randomDate(daysBack = 5) {
  const now = Date.now();
  const offset = Math.random() * daysBack * 86400000;
  return new Date(now - offset).toISOString();
}

export function generateNewsFeed(): NewsItem[] {
  const items: NewsItem[] = [];
  let id = 1;

  for (const event of EVENTS) {
    const symbol = SYMBOLS[id % SYMBOLS.length];
    const useSymbol = event.keywords.some(
      (k) => symbol.toUpperCase().includes(k.toUpperCase()) || k.toUpperCase().includes(symbol.toUpperCase())
    )
      ? SYMBOLS.find((s) => event.titleEn.toUpperCase().includes(s)) ?? symbol
      : symbol;

    items.push({
      id: `news_${id++}`,
      symbol: useSymbol,
      titleEn: event.titleEn,
      titleTr: event.titleTr,
      source: ["Bloomberg", "Reuters", "CNBC", "WSJ", "Financial Times"][Math.floor(Math.random() * 5)],
      url: "#",
      publishedAt: randomDate(5),
      sentiment: event.sentiment,
      impactScore: event.impact,
      keywords: event.keywords,
    });
  }

  return items.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
}

let cachedNews: NewsItem[] | null = null;

export function getNewsFeed(): NewsItem[] {
  if (!cachedNews) {
    cachedNews = generateNewsFeed();
  }
  return cachedNews;
}
