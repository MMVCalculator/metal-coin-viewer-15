
import { Coin } from "../types/coin";

// Mock data for our coins
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
      price: 18.20,
      priceChangePercentage24h: -1.24
    },
    {
      id: "jsola",
      name: "jSOLA",
      symbol: "jSOLA",
      imageUrl: "https://app.x10.games/_next/image?url=https%3A%2F%2Faddressables-dev.metalvalleygame.com%2FImage%2FSOLA_J_CoinBLUE.png&w=256&q=75",
      price: 32.15,
      priceChangePercentage24h: 5.67
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

// Format price to Thai Baht
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(price);
};

// Calculate value based on quantity
export const calculateValue = (price: number, quantity: number): number => {
  return price * quantity;
};
