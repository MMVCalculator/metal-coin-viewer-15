
export interface Coin {
  id: string;
  name: string;
  symbol: string;
  imageUrl: string;
  price: number; // Price in THB
  priceChangePercentage24h: number; // Price change
  isLive?: boolean; // Flag to indicate if the price is live data
}

// Bitkub API response type
export interface BitkubTickerResponse {
  THB_KUB?: {
    last: number;
    percentChange: number;
    baseVolume: number;
    quoteVolume: number;
    isFrozen: number;
    high24hr: number;
    low24hr: number;
  };
  THB_JFIN?: {
    last: number;
    percentChange: number;
    baseVolume: number;
    quoteVolume: number;
    isFrozen: number;
    high24hr: number;
    low24hr: number;
  };
}
