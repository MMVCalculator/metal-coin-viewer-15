import { Coin, BitkubTickerResponse, GeckoTerminalResponse } from "../types/coin";

// Fetch live KUB price from Bitkub API
export const fetchKubPrice = async (): Promise<{ price: number; change: number } | null> => {
  try {
    const response = await fetch("https://api.bitkub.com/api/market/ticker?sym=THB_KUB");
    const data: BitkubTickerResponse = await response.json();
    
    if (data.THB_KUB) {
      return {
        price: data.THB_KUB.last,
        change: data.THB_KUB.percentChange // Using percentChange directly, which is a number
      };
    }
    return null;
  } catch (error) {
    console.error("Error fetching KUB price:", error);
    return null;
  }
};

// Fetch live JFIN price from Bitkub API
export const fetchJfinPrice = async (): Promise<{ price: number; change: number } | null> => {
  try {
    const response = await fetch("https://api.bitkub.com/api/market/ticker?sym=THB_JFIN");
    const data: BitkubTickerResponse = await response.json();
    
    if (data.THB_JFIN) {
      return {
        price: data.THB_JFIN.last,
        change: data.THB_JFIN.percentChange // Using percentChange directly
      };
    }
    return null;
  } catch (error) {
    console.error("Error fetching JFIN price:", error);
    return null;
  }
};

// Fetch kSOLA/KUB price from GeckoTerminal
export const fetchKSolaPrice = async (): Promise<{ price: number; change: number } | null> => {
  try {
    // GeckoTerminal API for kSOLA/KUB pair on Bitkub Chain
    const response = await fetch("https://api.geckoterminal.com/api/v2/networks/bitkub_chain/pools/0x930dea5a8a1f51320d9fa80de00f334303df1e71");
    const data: GeckoTerminalResponse = await response.json();
    
    if (data && data.data && data.data.attributes) {
      // Get kSOLA/KUB price
      const kSolaPriceInKub = parseFloat(data.data.attributes.base_token_price_native_quote || "0");
      // Get 24h price change percentage
      const priceChange = data.data.attributes.price_change_percentage["24h"] || 0;
      
      // Get KUB/THB price to convert kSOLA to THB
      const kubData = await fetchKubPrice();
      
      if (kubData) {
        // Calculate kSOLA price in THB: kSOLA/KUB * KUB/THB
        const kSolaPriceInThb = kSolaPriceInKub * kubData.price;
        
        return {
          price: kSolaPriceInThb,
          change: priceChange
        };
      }
      
      // If we can't get KUB price, just return kSOLA/KUB with the change
      return {
        price: kSolaPriceInKub,
        change: priceChange
      };
    }
    
    return null;
  } catch (error) {
    console.error("Error fetching kSOLA price from GeckoTerminal:", error);
    return null;
  }
};

// Get initial mock data for coins
export const getCoins = (): Coin[] => {
  return [
    {
      id: "ksola",
      name: "kSOLA",
      symbol: "kSOLA",
      imageUrl: "https://app.x10.games/_next/image?url=https%3A%2F%2Faddressables-dev.metalvalleygame.com%2FImage%2FSOLA_K_CoinGREEN.png&w=256&q=75",
      price: 25.75,
      priceChangePercentage24h: 3.42
    },
    {
      id: "isola",
      name: "iSOLA",
      symbol: "iSOLA",
      imageUrl: "https://app.x10.games/_next/image?url=https%3A%2F%2Faddressables-dev.metalvalleygame.com%2FImage%2FSOLA_I_CoinWHITE.png&w=256&q=75",
      price: 0, // Updated to 0
      priceChangePercentage24h: 0
    },
    {
      id: "jsola",
      name: "jSOLA",
      symbol: "jSOLA",
      imageUrl: "https://app.x10.games/_next/image?url=https%3A%2F%2Faddressables-dev.metalvalleygame.com%2FImage%2FSOLA_J_CoinBLUE.png&w=256&q=75",
      price: 0, // Updated to 0
      priceChangePercentage24h: 0
    },
    {
      id: "kub",
      name: "KUB",
      symbol: "KUB",
      imageUrl: "https://app.x10.games/_next/image?url=%2Fimages%2Fmetal-valley%2Ficons%2Fkub.png&w=32&q=75",
      price: 102.50,
      priceChangePercentage24h: 0.89
    },
    {
      id: "jfin",
      name: "JFIN",
      symbol: "JFIN",
      imageUrl: "https://app.x10.games/_next/image?url=%2Fimages%2Fmetal-valley%2Ficons%2Fjfin.png&w=16&q=75",
      price: 45.30,
      priceChangePercentage24h: -0.75
    }
  ];
};

// Get coins with live KUB, JFIN, and kSOLA prices if available
export const getCoinsWithLiveData = async (): Promise<Coin[]> => {
  const coins = getCoins();
  
  try {
    // Fetch KUB, JFIN, and kSOLA data in parallel
    const [kubData, jfinData, kSolaData] = await Promise.all([
      fetchKubPrice(),
      fetchJfinPrice(),
      fetchKSolaPrice()
    ]);
    
    return coins.map(coin => {
      if (coin.id === "kub" && kubData) {
        return {
          ...coin,
          price: kubData.price,
          priceChangePercentage24h: kubData.change,
          isLive: true
        };
      }
      
      if (coin.id === "jfin" && jfinData) {
        return {
          ...coin,
          price: jfinData.price,
          priceChangePercentage24h: jfinData.change,
          isLive: true
        };
      }
      
      if (coin.id === "ksola" && kSolaData) {
        return {
          ...coin,
          price: kSolaData.price,
          priceChangePercentage24h: kSolaData.change,
          isLive: true
        };
      }
      
      return coin;
    });
  } catch (error) {
    console.error("Error updating live prices:", error);
  }
  
  // Return original coins if fetch fails
  return coins;
};

// Format price to Thai Baht with 3 decimal places
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 3,
    maximumFractionDigits: 3
  }).format(price);
};

// Calculate value based on quantity
export const calculateValue = (price: number, quantity: number): number => {
  return price * quantity;
};
