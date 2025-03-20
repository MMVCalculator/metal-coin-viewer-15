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

// GeckoTerminal API response type
export interface GeckoTerminalResponse {
  data: {
    id: string;
    type: string;
    attributes: {
      name: string;
      base_token_price_usd: string;
      quote_token_price_usd: string;
      base_token_price_native_quote: string; // kSOLA/KUB price
      price_change_percentage: {
        "24h": number;
      };
      // Other attributes we might not need right now
    };
    // Other data we might not need right now
  };
}
