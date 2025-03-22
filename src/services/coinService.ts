import {
  Coin,
  BitkubTickerResponse,
  GeckoTerminalResponse,
} from "../types/coin";

// Fetch live KUB price from Bitkub API
export const fetchKubPrice = async (): Promise<{
  price: number;
  change: number;
} | null> => {
  try {
    const response = await fetch(
      "https://api.bitkub.com/api/market/ticker?sym=THB_KUB"
    );
    const data: BitkubTickerResponse = await response.json();

    if (data.THB_KUB) {
      return {
        price: data.THB_KUB.last,
        change: data.THB_KUB.percentChange, // Using percentChange directly, which is a number
      };
    }
    return null;
  } catch (error) {
    console.error("Error fetching KUB price:", error);
    return null;
  }
};

// Fetch live JFIN price from Bitkub API
export const fetchJfinPrice = async (): Promise<{
  price: number;
  change: number;
} | null> => {
  try {
    const response = await fetch(
      "https://api.bitkub.com/api/market/ticker?sym=THB_JFIN"
    );
    const data: BitkubTickerResponse = await response.json();

    if (data.THB_JFIN) {
      return {
        price: data.THB_JFIN.last,
        change: data.THB_JFIN.percentChange, // Using percentChange directly
      };
    }
    return null;
  } catch (error) {
    console.error("Error fetching JFIN price:", error);
    return null;
  }
};

// ฟังก์ชันสำหรับดึงข้อมูลราคาเหรียญจาก GeckoTerminal
export const fetchCoinPriceFromGeckoTerminal = async (
  networkId: string,
  dexId: string,
  pairAddress: string
): Promise<{ price: number; change: number } | null> => {
  try {
    const url = `https://api.geckoterminal.com/api/v2/networks/${networkId}/dexes/${dexId}/pools/${pairAddress}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: GeckoTerminalResponse = await response.json();

    if (data && data.data && data.data.attributes) {
      // แปลงราคาจากสตริงเป็นตัวเลข
      const price = parseFloat(
        data.data.attributes.base_token_price_native_quote
      );
      const change = data.data.attributes.price_change_percentage["24h"] || 0;

      return { price, change };
    }

    return null;
  } catch (error) {
    console.error(`Error fetching price from GeckoTerminal:`, error);
    return null;
  }
};

// ดึงราคา kSOLA จาก GeckoTerminal
export const fetchKSolaPrice = async (): Promise<{
  price: number;
  change: number;
} | null> => {
  try {
    // ใช้ simple token price API endpoint พร้อมพารามิเตอร์เพิ่มเติมเพื่อให้ได้ข้อมูล price change และอื่นๆ
    const kSolaTokenAddress = "0x9cf6df95b918307ff81fef70e616a094e9977a28";
    const url = `https://api.geckoterminal.com/api/v2/simple/networks/bitkub_chain/token_price/${kSolaTokenAddress}?include_market_cap=true&mcap_fdv_fallback=true&include_24hr_vol=true&include_24hr_price_change=true&include_total_reserve_in_usd=true`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // ตรวจสอบว่ามีข้อมูลราคาและการเปลี่ยนแปลงของโทเคน
    if (
      data?.data?.attributes?.token_prices?.[kSolaTokenAddress] &&
      data?.data?.attributes?.h24_price_change_percentage?.[kSolaTokenAddress]
    ) {
      const priceUsd = parseFloat(
        data.data.attributes.token_prices[kSolaTokenAddress]
      );
      const priceChange = parseFloat(
        data.data.attributes.h24_price_change_percentage[kSolaTokenAddress]
      );
      const marketCapUsd = parseFloat(
        data.data.attributes.market_cap_usd[kSolaTokenAddress] || "0"
      );
      const volume24h = parseFloat(
        data.data.attributes.h24_volume_usd[kSolaTokenAddress] || "0"
      );

      // คำนวณราคาในบาท (THB) โดยใช้อัตราแลกเปลี่ยน USD/THB
      const exchangeRate = 34;
      const priceTHB = priceUsd * exchangeRate;

      console.log(
        "ใช้ข้อมูล kSOLA real-time แบบสมบูรณ์จาก simple token price API สำหรับ address:",
        kSolaTokenAddress
      );
      console.log(
        `ข้อมูลเพิ่มเติม: Market Cap: $${marketCapUsd.toLocaleString()}, 24h Volume: $${volume24h.toLocaleString()}`
      );

      return {
        price: priceTHB,
        change: priceChange,
      };
    }

    // ถ้าไม่พบข้อมูลจาก simple API enhanced ให้ลองใช้ simple API แบบพื้นฐาน
    console.log("ไม่พบข้อมูลแบบสมบูรณ์ ลองใช้ API แบบพื้นฐาน");

    const basicUrl = `https://api.geckoterminal.com/api/v2/simple/networks/bitkub_chain/token_price/${kSolaTokenAddress}`;
    const basicResponse = await fetch(basicUrl);

    if (!basicResponse.ok) {
      throw new Error(`HTTP error! status: ${basicResponse.status}`);
    }

    const basicData = await basicResponse.json();

    if (basicData?.data?.attributes?.token_prices?.[kSolaTokenAddress]) {
      const priceUsd = parseFloat(
        basicData.data.attributes.token_prices[kSolaTokenAddress]
      );

      // เนื่องจาก simple API แบบพื้นฐานไม่มีข้อมูล price change จึงต้องดึงจาก trending pools
      let priceChange = 0;

      try {
        // ลองดึงข้อมูล price change จาก trending pools
        const poolsUrl = `https://api.geckoterminal.com/api/v2/networks/bitkub_chain/trending_pools`;
        const poolsResponse = await fetch(poolsUrl);

        if (poolsResponse.ok) {
          const poolsData = await poolsResponse.json();
          const kSolaPoolId =
            "bitkub_chain_0x930dea5a8a1f51320d9fa80de00f334303df1e71";
          const kSolaPool = poolsData.data.find(
            (pool: any) => pool.id === kSolaPoolId
          );

          if (kSolaPool?.attributes?.price_change_percentage?.h24) {
            priceChange = parseFloat(
              kSolaPool.attributes.price_change_percentage.h24
            );
          }
        }
      } catch (changeError) {
        console.error("Error fetching price change data:", changeError);
      }

      // คำนวณราคาในบาท (THB)
      const exchangeRate = 34;
      const priceTHB = priceUsd * exchangeRate;

      console.log(
        "ใช้ข้อมูล kSOLA ราคาจาก simple API แบบพื้นฐาน, และข้อมูลเปลี่ยนแปลงจากแหล่งอื่น"
      );

      return {
        price: priceTHB,
        change: priceChange,
      };
    }

    // ถ้าไม่พบข้อมูลจาก simple API ทั้งสองประเภท ให้ลองใช้ trending pools แทน
    console.log(
      "ไม่พบข้อมูลจาก simple token price API, ลองใช้ trending pools แทน"
    );

    // ใช้ API endpoint trending_pools ของ GeckoTerminal
    const trendingUrl = `https://api.geckoterminal.com/api/v2/networks/bitkub_chain/trending_pools`;
    const trendingResponse = await fetch(trendingUrl);

    if (!trendingResponse.ok) {
      throw new Error(`HTTP error! status: ${trendingResponse.status}`);
    }

    const trendingData = await trendingResponse.json();

    // ค้นหา kSOLA pool โดยใช้ pool ID โดยตรง
    if (trendingData && trendingData.data && Array.isArray(trendingData.data)) {
      // ค้นหา pool โดย ID ที่เฉพาะเจาะจง
      const kSolaPoolId =
        "bitkub_chain_0x930dea5a8a1f51320d9fa80de00f334303df1e71";
      const kSolaPool = trendingData.data.find(
        (pool: any) => pool.id === kSolaPoolId
      );

      if (kSolaPool && kSolaPool.attributes) {
        // ใช้ราคาของ base token (kSOLA) ในสกุล USD
        const priceUsd = parseFloat(kSolaPool.attributes.base_token_price_usd);
        const priceChange =
          parseFloat(kSolaPool.attributes.price_change_percentage.h24) || 0;

        // คำนวณราคาในบาท (THB) โดยใช้อัตราแลกเปลี่ยน USD/THB
        const exchangeRate = 34;
        const priceTHB = priceUsd * exchangeRate;

        console.log(
          "ใช้ข้อมูล kSOLA real-time จาก pool ID:",
          kSolaPool.id,
          "ชื่อ:",
          kSolaPool.attributes.name
        );
        return {
          price: priceTHB,
          change: priceChange,
        };
      }

      // ถ้าไม่พบโดย ID ลองค้นหาจากชื่อ pool แทน (fallback)
      const kSolaPoolByName = trendingData.data.find(
        (pool: any) =>
          pool.attributes?.name?.includes("kSOLA") ||
          pool.attributes?.name?.includes("KSOLA")
      );

      if (kSolaPoolByName && kSolaPoolByName.attributes) {
        // ใช้ราคาของ base token (kSOLA) ในสกุล USD
        const priceUsd = parseFloat(
          kSolaPoolByName.attributes.base_token_price_usd
        );
        const priceChange =
          parseFloat(kSolaPoolByName.attributes.price_change_percentage.h24) ||
          0;

        // คำนวณราคาในบาท (THB) โดยใช้อัตราแลกเปลี่ยน USD/THB
        const exchangeRate = 34;
        const priceTHB = priceUsd * exchangeRate;

        console.log(
          "ใช้ข้อมูล kSOLA real-time จากการค้นหาชื่อ pool:",
          kSolaPoolByName.attributes.name
        );
        return {
          price: priceTHB,
          change: priceChange,
        };
      }
    }

    console.log("ไม่พบข้อมูล kSOLA ใน trending pools, ใช้วิธีคำนวณแบบเดิม");
    // กรณีไม่พบ pool ของ kSOLA ใช้วิธีคำนวณแบบเดิม
    // Fixed value of kSOLA in KUB
    const kSolaPriceInKub = 0.02897;

    // Get KUB/THB price to convert kSOLA to THB
    const kubData = await fetchKubPrice();

    if (kubData) {
      // Calculate kSOLA price in THB: kSOLA/KUB * KUB/THB
      const kSolaPriceInThb = kSolaPriceInKub * kubData.price;
      const priceChange = kubData.change;

      console.log("ใช้วิธีการคำนวณดั้งเดิมสำหรับราคา kSOLA");
      return {
        price: kSolaPriceInThb,
        change: priceChange,
      };
    }

    return null;
  } catch (error) {
    console.error("Error fetching kSOLA price:", error);

    // ใช้ fallback วิธีในกรณีที่มี error
    try {
      // Fixed value of kSOLA in KUB
      const kSolaPriceInKub = 0.02897;

      // Get KUB/THB price to convert kSOLA to THB
      const kubData = await fetchKubPrice();

      if (kubData) {
        // Calculate kSOLA price in THB: kSOLA/KUB * KUB/THB
        const kSolaPriceInThb = kSolaPriceInKub * kubData.price;
        const priceChange = kubData.change;

        console.log("ใช้วิธีการคำนวณดั้งเดิมหลังจากเกิด API error");
        return {
          price: kSolaPriceInThb,
          change: priceChange,
        };
      }
    } catch (fallbackError) {
      console.error("Error in fallback calculation for kSOLA:", fallbackError);
    }

    return null;
  }
};

// ดึงราคา iSOLA จาก GeckoTerminal
export const fetchIsolaPrice = async (): Promise<{
  price: number;
  change: number;
} | null> => {
  try {
    // ใช้ข้อมูลจริงจาก diamon_finance DEX
    // อาจต้องค้นหา pool ID ที่ถูกต้องสำหรับ iSOLA
    const url = `https://api.geckoterminal.com/api/v2/networks/bitkub_chain/trending_pools`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // ใช้วิธีการคำนวณราคาจาก JFIN เป็นหลัก เนื่องจากอาจไม่มีข้อมูล iSOLA ใน trending pools
    // Fixed value of iSOLA in JFIN
    const iSolaPriceInJfin = 0.241576;

    // Get JFIN/THB price to convert iSOLA to THB
    const jfinData = await fetchJfinPrice();

    if (jfinData) {
      // Calculate iSOLA price in THB: iSOLA/JFIN * JFIN/THB
      const iSolaPriceInThb = iSolaPriceInJfin * jfinData.price;

      console.log("Using calculation method for iSOLA price");
      return {
        price: iSolaPriceInThb,
        change: jfinData.change,
      };
    }

    return null;
  } catch (error) {
    console.error("Error fetching iSOLA price:", error);

    // ใช้ fallback วิธีในกรณีที่มี error
    try {
      // Fixed value of iSOLA in JFIN
      const iSolaPriceInJfin = 0.241576;

      // Get JFIN/THB price to convert iSOLA to THB
      const jfinData = await fetchJfinPrice();

      if (jfinData) {
        // Calculate iSOLA price in THB: iSOLA/JFIN * JFIN/THB
        const iSolaPriceInThb = iSolaPriceInJfin * jfinData.price;

        console.log("Using fallback method for iSOLA price after API error");
        return {
          price: iSolaPriceInThb,
          change: jfinData.change,
        };
      }
    } catch (fallbackError) {
      console.error("Error in fallback calculation for iSOLA:", fallbackError);
    }

    return null;
  }
};

// ดึงราคา jSOLA จาก GeckoTerminal
export const fetchJsolaPrice = async (): Promise<{
  price: number;
  change: number;
} | null> => {
  try {
    // ดึงราคา iSOLA ก่อนเพื่อคำนวณราคา jSOLA
    const iSolaData = await fetchIsolaPrice();

    if (iSolaData) {
      // อัตราส่วนของ jSOLA ต่อ iSOLA - 1 jSOLA = 1.140 iSOLA
      const jSolaPriceInIsola = 1.14;

      // คำนวณราคา jSOLA เป็นบาท: jSOLA/iSOLA * iSOLA/THB
      const jSolaPriceInThb = jSolaPriceInIsola * iSolaData.price;

      console.log("ใช้การคำนวณราคา jSOLA จากราคา iSOLA (อัตราส่วน 1:1.140)");
      return {
        price: jSolaPriceInThb,
        change: iSolaData.change, // ใช้ percent change เดียวกับ iSOLA
      };
    }

    return null;
  } catch (error) {
    console.error("Error fetching jSOLA price:", error);

    // ใช้ fallback วิธีในกรณีที่มี error
    try {
      // ดึงราคา iSOLA อีกครั้งเพื่อคำนวณราคา jSOLA
      const iSolaData = await fetchIsolaPrice();

      if (iSolaData) {
        // อัตราส่วนของ jSOLA ต่อ iSOLA - 1 jSOLA = 1.140 iSOLA
        const jSolaPriceInIsola = 1.14;

        // คำนวณราคา jSOLA เป็นบาท: jSOLA/iSOLA * iSOLA/THB
        const jSolaPriceInThb = jSolaPriceInIsola * iSolaData.price;

        console.log(
          "ใช้วิธี fallback สำหรับราคา jSOLA หลังจากเกิด error (อัตราส่วน 1:1.140)"
        );
        return {
          price: jSolaPriceInThb,
          change: iSolaData.change, // ใช้ percent change เดียวกับ iSOLA
        };
      }
    } catch (fallbackError) {
      console.error("Error in fallback calculation for jSOLA:", fallbackError);
    }

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
      imageUrl:
        "https://app.x10.games/_next/image?url=https%3A%2F%2Faddressables-dev.metalvalleygame.com%2FImage%2FSOLA_K_CoinGREEN.png&w=256&q=75",
      price: 25.75,
      priceChangePercentage24h: 3.42,
    },
    {
      id: "isola",
      name: "iSOLA",
      symbol: "iSOLA",
      imageUrl:
        "https://app.x10.games/_next/image?url=https%3A%2F%2Faddressables-dev.metalvalleygame.com%2FImage%2FSOLA_I_CoinWHITE.png&w=256&q=75",
      price: 0, // Updated to 0
      priceChangePercentage24h: 0,
    },
    {
      id: "jsola",
      name: "jSOLA",
      symbol: "jSOLA",
      imageUrl:
        "https://app.x10.games/_next/image?url=https%3A%2F%2Faddressables-dev.metalvalleygame.com%2FImage%2FSOLA_J_CoinBLUE.png&w=256&q=75",
      price: 0, // Updated to 0
      priceChangePercentage24h: 0,
    },
    {
      id: "kub",
      name: "KUB",
      symbol: "KUB",
      imageUrl:
        "https://app.x10.games/_next/image?url=%2Fimages%2Fmetal-valley%2Ficons%2Fkub.png&w=32&q=75",
      price: 102.5,
      priceChangePercentage24h: 0.89,
    },
    {
      id: "jfin",
      name: "JFIN",
      symbol: "JFIN",
      imageUrl:
        "https://app.x10.games/_next/image?url=%2Fimages%2Fmetal-valley%2Ficons%2Fjfin.png&w=16&q=75",
      price: 45.3,
      priceChangePercentage24h: -0.75,
    },
  ];
};

// Get coins with live KUB, JFIN, kSOLA, iSOLA and jSOLA prices if available
export const getCoinsWithLiveData = async (): Promise<Coin[]> => {
  const coins = getCoins();

  try {
    // Fetch KUB, JFIN, kSOLA, iSOLA and jSOLA data in parallel
    const [kubData, jfinData, kSolaData, iSolaData, jSolaData] =
      await Promise.all([
        fetchKubPrice(),
        fetchJfinPrice(),
        fetchKSolaPrice(),
        fetchIsolaPrice(),
        fetchJsolaPrice(), // เพิ่มการดึงข้อมูล jSOLA
      ]);

    return coins.map((coin) => {
      if (coin.id === "kub" && kubData) {
        return {
          ...coin,
          price: kubData.price,
          priceChangePercentage24h: kubData.change,
          isLive: true,
        };
      }

      if (coin.id === "jfin" && jfinData) {
        return {
          ...coin,
          price: jfinData.price,
          priceChangePercentage24h: jfinData.change,
          isLive: true,
        };
      }

      if (coin.id === "ksola" && kSolaData) {
        return {
          ...coin,
          price: kSolaData.price,
          priceChangePercentage24h: kSolaData.change,
          isLive: true,
        };
      }

      if (coin.id === "isola" && iSolaData) {
        return {
          ...coin,
          price: iSolaData.price,
          priceChangePercentage24h: iSolaData.change,
          isLive: true,
        };
      }

      // เพิ่มเงื่อนไขสำหรับ jSOLA
      if (coin.id === "jsola" && jSolaData) {
        return {
          ...coin,
          price: jSolaData.price,
          priceChangePercentage24h: jSolaData.change,
          isLive: true,
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
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  }).format(price);
};

// Calculate value based on quantity
export const calculateValue = (price: number, quantity: number): number => {
  return price * quantity;
};
