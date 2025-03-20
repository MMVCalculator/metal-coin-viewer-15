
import { useState, useEffect } from "react";
import CoinCard from "../components/CoinCard";
import Header from "../components/Header";
import { getCoins } from "../services/coinService";
import { Coin } from "../types/coin";

const Index = () => {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call with a small delay
    const fetchCoins = async () => {
      setLoading(true);
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 800));
      const data = getCoins();
      setCoins(data);
      setLoading(false);
    };

    fetchCoins();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-subtle pb-20">
      <Header />
      
      <main className="container max-w-7xl mx-auto pt-32 px-4 sm:px-6">
        <div className="text-center mb-16 animate-slide-up">
          <div className="inline-block px-3 py-1 rounded-full text-xs bg-blue-50 text-blue-800 mb-4">
            Metal Valley Game
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700">
            เช็คราคาเหรียญ Metal Valley
          </h1>
          <p className="text-slate-600 max-w-2xl mx-auto">
            ตรวจสอบราคาเหรียญ kSOLA, iSOLA, jSOLA, KUB และ JFIN
            และคำนวณมูลค่าเป็นบาทไทยได้ทันที
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white/50 h-64 rounded-xl"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coins.map((coin, index) => (
              <div 
                key={coin.id} 
                className="opacity-0 animate-fade-in" 
                style={{ animationDelay: `${index * 0.1}s`, animationFillMode: 'forwards' }}
              >
                <CoinCard coin={coin} />
              </div>
            ))}
          </div>
        )}
      </main>
      
      <footer className="mt-20 py-6 text-center text-sm text-gray-500">
        <p>
          ข้อมูลราคาจำลองเพื่อการสาธิตเท่านั้น ไม่สามารถใช้อ้างอิงได้
        </p>
      </footer>
    </div>
  );
};

export default Index;
