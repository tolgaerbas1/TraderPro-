import type { NewsSentiment } from "./types";

const POSITIVE_KEYWORDS = [
  "earnings beat", "revenue growth", "record", "raised guidance", "upgrade",
  "buyback", "dividend increase", "FDA approval", "new product", "partnership",
  "acquisition", "expansion", "breakthrough", "strong demand", "beat estimates",
  "surged", "rallied", "climbs", "soars", "milestone", "rekor", "arttı",
  "aştı", "yükseldi", "genişletiyor", "hızlandı",
];

const NEGATIVE_KEYWORDS = [
  "investigation", "fine", "lawsuit", "recall", "layoff", "cuts guidance",
  "downgrade", "weak demand", "loss", "debt", "bankruptcy", "crash", "plunges",
  "tumbles", "decline", "warning", "antitrust", "export restriction",
  "soruşturma", "ceza", "düşürdü", "zayıf", "kısıtlama",
];

export function analyzeSentiment(text: string): { sentiment: NewsSentiment; score: number } {
  const lower = text.toLowerCase();
  let score = 0;

  for (const kw of POSITIVE_KEYWORDS) {
    if (lower.includes(kw.toLowerCase())) score += 0.25;
  }

  for (const kw of NEGATIVE_KEYWORDS) {
    if (lower.includes(kw.toLowerCase())) score -= 0.3;
  }

  const clamped = Math.max(-1, Math.min(1, score));
  const sentiment: NewsSentiment = clamped > 0.1 ? "positive" : clamped < -0.1 ? "negative" : "neutral";

  return { sentiment, score: clamped };
}

export function impactLabel(score: number, lang: "tr" | "en"): string {
  if (score > 0.6) return lang === "tr" ? "Yüksek Pozitif" : "High Positive";
  if (score > 0.2) return lang === "tr" ? "Pozitif" : "Positive";
  if (score < -0.6) return lang === "tr" ? "Yüksek Negatif" : "High Negative";
  if (score < -0.2) return lang === "tr" ? "Negatif" : "Negative";
  return lang === "tr" ? "Nötr" : "Neutral";
}

export function impactColor(score: number): string {
  if (score > 0.6) return "text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/20";
  if (score > 0.2) return "text-emerald-500 bg-emerald-50/50 dark:text-emerald-300 dark:bg-emerald-900/10";
  if (score < -0.6) return "text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20";
  if (score < -0.2) return "text-red-500 bg-red-50/50 dark:text-red-300 dark:bg-red-900/10";
  return "text-zinc-500 bg-zinc-50 dark:text-zinc-400 dark:bg-zinc-800/50";
}
