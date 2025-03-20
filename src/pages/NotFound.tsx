
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-subtle">
      <div className="text-center p-8 max-w-md animate-scale-in">
        <h1 className="text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700">404</h1>
        <p className="text-xl text-slate-600 mb-8">ไม่พบหน้าที่คุณต้องการ</p>
        <Button 
          asChild
          className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-full transition-all"
        >
          <a href="/">กลับไปหน้าหลัก</a>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
