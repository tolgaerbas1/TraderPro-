export interface InvestorHolding {
  symbol: string;
  name: string;
  weight: number;
  shares: number;
  value: number;
  changeQtr: "increased" | "decreased" | "new" | "unchanged";
  changePercent: number;
}

export interface Investor {
  id: string;
  name: string;
  firm: string;
  style: string;
  bioEn: string;
  bioTr: string;
  totalPortfolioValue: number;
  topHoldings: InvestorHolding[];
  recentMovesEn: string;
  recentMovesTr: string;
}

export const INVESTORS: Investor[] = [
  {
    id: "buffett",
    name: "Warren Buffett",
    firm: "Berkshire Hathaway",
    style: "Value, Long-term",
    bioEn: "Legendary value investor. CEO of Berkshire Hathaway. Focuses on businesses with durable competitive advantages and strong management.",
    bioTr: "Efsanevi değer yatırımcısı. Berkshire Hathaway CEO'su. Kalıcı rekabet avantajı ve güçlü yönetime sahip işletmelere odaklanır.",
    totalPortfolioValue: 314_000_000_000,
    recentMovesEn: "Trimmed AAPL position slightly in Q1 2025. Added to OXY, SIRI. Sold JPM and GS completely. Maintained large cash position ~$189B.",
    recentMovesTr: "2025 Q1'de AAPL pozisyonunu hafif azalttı. OXY, SIRI'ye ekledi. JPM ve GS'yi tamamen sattı. ~$189B nakit pozisyonu korudu.",
    topHoldings: [
      { symbol: "AAPL", name: "Apple Inc.", weight: 44.2, shares: 905_000_000, value: 138_000_000_000, changeQtr: "decreased", changePercent: -5.2 },
      { symbol: "BAC", name: "Bank of America", weight: 10.1, shares: 1_032_000_000, value: 31_500_000_000, changeQtr: "unchanged", changePercent: 0 },
      { symbol: "AXP", name: "American Express", weight: 8.3, shares: 151_000_000, value: 26_000_000_000, changeQtr: "unchanged", changePercent: 0 },
      { symbol: "KO", name: "Coca-Cola", weight: 7.1, shares: 400_000_000, value: 22_200_000_000, changeQtr: "unchanged", changePercent: 0 },
      { symbol: "CVX", name: "Chevron", weight: 5.8, shares: 123_000_000, value: 18_100_000_000, changeQtr: "unchanged", changePercent: 0 },
    ],
  },
  {
    id: "burry",
    name: "Michael Burry",
    firm: "Scion Asset Management",
    style: "Contrarian, Macro",
    bioEn: "Famous for predicting the 2008 housing crash (The Big Short). Deep value investor with a macro overlay. Takes concentrated positions.",
    bioTr: "2008 konut krizini öngörmesiyle ünlü (The Big Short). Makro bakış açılı derin değer yatırımcısı. Konsantre pozisyonlar alır.",
    totalPortfolioValue: 210_000_000,
    recentMovesEn: "Built large BABA position. Added JD.com and Chinese tech. Sold banks. Increased gold exposure via GDX. Bearish on US markets.",
    recentMovesTr: "Büyük BABA pozisyonu oluşturdu. JD.com ve Çin teknolojisine ekledi. Bankaları sattı. GDX ile altın pozisyonunu artırdı. ABD piyasalarında ayı.",
    topHoldings: [
      { symbol: "BABA", name: "Alibaba Group", weight: 24.1, shares: 500_000, value: 50_600_000, changeQtr: "increased", changePercent: 18.3 },
      { symbol: "JD", name: "JD.com", weight: 15.2, shares: 850_000, value: 31_900_000, changeQtr: "new", changePercent: 100 },
      { symbol: "GDX", name: "Gold Miners ETF", weight: 12.8, shares: 700_000, value: 26_900_000, changeQtr: "increased", changePercent: 25 },
      { symbol: "BIDU", name: "Baidu", weight: 9.5, shares: 200_000, value: 20_000_000, changeQtr: "new", changePercent: 100 },
      { symbol: "MOH", name: "Molina Healthcare", weight: 8.3, shares: 60_000, value: 17_400_000, changeQtr: "unchanged", changePercent: 0 },
    ],
  },
  {
    id: "ackman",
    name: "Bill Ackman",
    firm: "Pershing Square Capital",
    style: "Activist, Concentrated",
    bioEn: "Activist investor known for taking large stakes and pushing for corporate change. Runs a highly concentrated portfolio of 8-12 positions.",
    bioTr: "Büyük pozisyonlar alıp kurumsal değişim için baskı yapmasıyla tanınan aktivist yatırımcı. 8-12 pozisyonlu konsantre portföy yönetir.",
    totalPortfolioValue: 16_200_000_000,
    recentMovesEn: "Added to GOOGL significantly. Trimmed CMG after strong run. New position in Nike (NKE). Maintained conviction in HLT.",
    recentMovesTr: "GOOGL'ye önemli ölçüde ekledi. Güçlü yükseliş sonrası CMG'yi azalttı. Nike'ta (NKE) yeni pozisyon. HLT'de inancını korudu.",
    topHoldings: [
      { symbol: "GOOGL", name: "Alphabet Inc.", weight: 18.2, shares: 16_500_000, value: 2_950_000_000, changeQtr: "increased", changePercent: 12.5 },
      { symbol: "CMG", name: "Chipotle", weight: 15.1, shares: 800_000, value: 2_450_000_000, changeQtr: "decreased", changePercent: -8.3 },
      { symbol: "HLT", name: "Hilton Worldwide", weight: 12.4, shares: 8_500_000, value: 2_010_000_000, changeQtr: "unchanged", changePercent: 0 },
      { symbol: "QSR", name: "Restaurant Brands", weight: 10.8, shares: 25_000_000, value: 1_750_000_000, changeQtr: "unchanged", changePercent: 0 },
      { symbol: "NKE", name: "Nike Inc.", weight: 8.5, shares: 15_000_000, value: 1_380_000_000, changeQtr: "new", changePercent: 100 },
    ],
  },
  {
    id: "wood",
    name: "Cathie Wood",
    firm: "ARK Invest",
    style: "Growth, Disruptive Innovation",
    bioEn: "Founder of ARK Invest. Focuses on disruptive innovation across AI, genomics, fintech, autonomous tech, and crypto. High conviction, high volatility.",
    bioTr: "ARK Invest kurucusu. AI, genomik, fintech, otonom teknoloji ve kripto alanlarında yıkıcı inovasyona odaklanır. Yüksek kanaat, yüksek volatilite.",
    totalPortfolioValue: 13_500_000_000,
    recentMovesEn: "Doubled down on TSLA during dip. Added COIN, RBLX. Reduced ZM. New position in TEM (Tempus AI). Continues buying ROKU.",
    recentMovesTr: "TSLA dip sırasında pozisyonu ikiye katladı. COIN, RBLX ekledi. ZM'yi azalttı. TEM'de (Tempus AI) yeni pozisyon. ROKU almaya devam.",
    topHoldings: [
      { symbol: "TSLA", name: "Tesla Inc.", weight: 14.2, shares: 7_500_000, value: 1_920_000_000, changeQtr: "increased", changePercent: 22 },
      { symbol: "ROKU", name: "Roku Inc.", weight: 8.1, shares: 12_000_000, value: 1_090_000_000, changeQtr: "increased", changePercent: 8.5 },
      { symbol: "COIN", name: "Coinbase", weight: 7.8, shares: 4_200_000, value: 1_050_000_000, changeQtr: "increased", changePercent: 15.3 },
      { symbol: "SQ", name: "Block Inc.", weight: 6.9, shares: 11_000_000, value: 930_000_000, changeQtr: "unchanged", changePercent: 0 },
      { symbol: "RBLX", name: "Roblox Corp", weight: 5.5, shares: 18_000_000, value: 740_000_000, changeQtr: "increased", changePercent: 10.2 },
    ],
  },
  {
    id: "druckenmiller",
    name: "Stanley Druckenmiller",
    firm: "Duquesne Family Office",
    style: "Macro, Opportunistic",
    bioEn: "Legendary macro trader with one of the best track records. Managed George Soros' Quantum Fund. Swings between aggressive long and defensive positions.",
    bioTr: "En iyi performans geçmişlerinden birine sahip efsanevi makro yatırımcı. George Soros'un Quantum Fonu'nu yönetti. Agresif long ve savunma pozisyonları arasında geçiş yapar.",
    totalPortfolioValue: 3_400_000_000,
    recentMovesEn: "Major position in NVDA (AI theme). Added MSFT and GOOGL. Trimmed energy positions. Increased cash allocation, signaling caution.",
    recentMovesTr: "NVDA'da büyük pozisyon (AI teması). MSFT ve GOOGL ekledi. Enerji pozisyonlarını azalttı. Nakit tahsisini artırdı, temkin sinyali.",
    topHoldings: [
      { symbol: "NVDA", name: "NVIDIA Corp", weight: 16.5, shares: 4_100_000, value: 560_000_000, changeQtr: "increased", changePercent: 35 },
      { symbol: "MSFT", name: "Microsoft Corp", weight: 11.2, shares: 920_000, value: 380_000_000, changeQtr: "new", changePercent: 100 },
      { symbol: "GOOGL", name: "Alphabet Inc.", weight: 8.8, shares: 1_700_000, value: 300_000_000, changeQtr: "new", changePercent: 100 },
      { symbol: "LLY", name: "Eli Lilly", weight: 7.4, shares: 350_000, value: 250_000_000, changeQtr: "increased", changePercent: 15 },
      { symbol: "GLD", name: "SPDR Gold ETF", weight: 6.1, shares: 1_100_000, value: 207_000_000, changeQtr: "increased", changePercent: 20 },
    ],
  },
  {
    id: "dalio",
    name: "Ray Dalio",
    firm: "Bridgewater Associates",
    style: "All-Weather, Risk Parity",
    bioEn: "Founder of the world's largest hedge fund. Pioneer of risk parity and the All-Weather portfolio strategy. Deep macro research approach.",
    bioTr: "Dünyanın en büyük hedge fonunun kurucusu. Risk paritesi ve All-Weather portföy stratejisinin öncüsü. Derin makro araştırma yaklaşımı.",
    totalPortfolioValue: 18_500_000_000,
    recentMovesEn: "Reduced US equities exposure. Added emerging markets. Increased gold and commodity exposure. Diversified across geographies.",
    recentMovesTr: "ABD hisseleri ağırlığını azalttı. Gelişmekte olan piyasalara ekledi. Altın ve emtia pozisyonunu artırdı. Coğrafi çeşitlendirme yaptı.",
    topHoldings: [
      { symbol: "SPY", name: "S&P 500 ETF", weight: 12.3, shares: 3_800_000, value: 2_280_000_000, changeQtr: "decreased", changePercent: -12 },
      { symbol: "IEMG", name: "iShares EM ETF", weight: 10.5, shares: 36_000_000, value: 1_940_000_000, changeQtr: "increased", changePercent: 18 },
      { symbol: "GLD", name: "SPDR Gold ETF", weight: 8.2, shares: 8_200_000, value: 1_520_000_000, changeQtr: "increased", changePercent: 25 },
      { symbol: "EWJ", name: "iShares Japan ETF", weight: 6.7, shares: 18_000_000, value: 1_240_000_000, changeQtr: "increased", changePercent: 10 },
      { symbol: "XLE", name: "Energy Select ETF", weight: 5.8, shares: 12_000_000, value: 1_070_000_000, changeQtr: "increased", changePercent: 8 },
    ],
  },
];
