
import { useState } from "react";
import { Coin } from "../types/coin";
import { formatPrice, calculateValue } from "../services/coinService";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface CoinCardProps {
  coin: Coin;
}

const CoinCard = ({ coin }: CoinCardProps) => {
  const [quantity, setQuantity] = useState<string>("");
  const [calculatedValue, setCalculatedValue] = useState<number | null>(null);

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow only numbers and decimal points
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setQuantity(value);
      
      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        setCalculatedValue(calculateValue(coin.price, numValue));
      } else {
        setCalculatedValue(null);
      }
    }
  };

  // Determine the class for price change
  const priceChangeClass = coin.priceChangePercentage24h >= 0 
    ? "text-green-600" 
    : "text-red-600";

  return (
    <Card className="coin-card overflow-hidden animate-scale-in">
      <div className="p-6">
        <div className="flex items-center mb-4">
          <div className="relative h-12 w-12 mr-4">
            <img 
              src={coin.imageUrl} 
              alt={coin.name} 
              className="coin-image h-full w-full object-contain animate-float"
              loading="lazy"
            />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center">
              <h3 className="text-xl font-semibold">{coin.name}</h3>
              {coin.isLive && (
                <Badge variant="outline" className="ml-2 bg-green-50 text-green-700 text-xs border-green-200">
                  Live
                </Badge>
              )}
            </div>
            <p className="text-sm text-gray-500">{coin.symbol}</p>
          </div>
        </div>
        
        <div className="mb-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">ราคาปัจจุบัน</p>
            <p className={`text-sm ${priceChangeClass}`}>
              {coin.priceChangePercentage24h >= 0 ? "+" : ""}
              {coin.priceChangePercentage24h.toFixed(2)}%
            </p>
          </div>
          <p className="text-2xl font-bold">{formatPrice(coin.price)}</p>
        </div>
        
        <div className="space-y-3">
          <div>
            <label htmlFor={`quantity-${coin.id}`} className="block text-sm text-gray-500 mb-1">
              จำนวนเหรียญ
            </label>
            <Input
              id={`quantity-${coin.id}`}
              type="text"
              value={quantity}
              onChange={handleQuantityChange}
              placeholder="ใส่จำนวนเหรียญ"
              className="input-effect w-full"
            />
          </div>
          
          {calculatedValue !== null && (
            <div className="p-3 bg-gray-50 rounded-md animate-fade-in">
              <p className="text-sm text-gray-500">มูลค่ารวม</p>
              <p className="text-lg font-semibold">{formatPrice(calculatedValue)}</p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default CoinCard;
