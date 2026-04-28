

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, CreditCard, Globe, Info } from "lucide-react";

const BuyCard = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({ phone: "", currency: "USD" });
  const [liveRates, setLiveRates] = useState(null);
  const [loading, setLoading] = useState(true);

  const packages = [
    { mins: 15, usd: 3.00 },
    { mins: 25, usd: 6.00 },
    { mins: 60, usd: 12.00 }
  ];

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const userPhone = localStorage.getItem("userPhone");
        const userRes = await axios.get(`http://localhost:5000/api/auth/current-user?phone=${encodeURIComponent(userPhone)}`);
        const rateRes = await axios.get('https://open.er-api.com/v6/latest/USD');

        if (userRes.data.success) {
          setUserData({ 
            phone: userRes.data.phone, 
            currency: userRes.data.currency || "USD" 
          });
        }
        if (rateRes.data && rateRes.data.rates) {
          setLiveRates(rateRes.data.rates);
        }
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    fetchInitialData();
  }, []);

  const getLocalPrice = (usdPrice) => {
    if (!liveRates || !userData.currency) return usdPrice.toFixed(2); 
    const rate = liveRates[userData.currency];
    if (!rate) return usdPrice.toFixed(2); 
    const total = usdPrice * rate;
    return Math.round(total).toLocaleString() + " " + userData.currency;
  };

  const handlePurchase = async (mins) => {
    try {
      const response = await axios.put('http://localhost:5000/api/auth/add-minutes', {
        phone: userData.phone,
        minutesToAdd: mins
      });
      if (response.data.success) {
        alert(`ተዓዊቱ! ${mins} ደቓይቕ ተወሲኹ።`);
        navigate("/home", { state: { refresh: Date.now(), userPhone: userData.phone } });
      }
    } catch (err) { alert("Error!"); }
  };

  if (loading) return <div className="bg-[#020617] h-screen flex items-center justify-center text-white">Connecting...</div>;

  return (
    <div className="fixed inset-0 bg-[#020617] text-white flex flex-col p-6 font-sans">
      <div className="flex justify-between items-start mb-8 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 bg-white/5 rounded-full"><ArrowLeft size={24}/></button>
          <div>
            <h1 className="text-xl font-black text-yellow-500 uppercase italic">Habesha Tele</h1>
            <p className="text-[10px] opacity-40 font-mono">{userData.phone}</p>
          </div>
        </div>
        <div className="text-right bg-yellow-500/10 p-2 px-3 rounded-2xl border border-yellow-500/20">
          <p className="text-[8px] uppercase font-black text-yellow-500 text-center mb-1">Exchange Rate</p>
          <p className="text-xs font-black italic">1 USD = {liveRates?.[userData.currency]?.toLocaleString()} {userData.currency}</p>
        </div>
      </div>

      <div className="space-y-4 overflow-y-auto scrollbar-hide pb-6">
        {packages.map((card, i) => (
          <div key={i} onClick={() => handlePurchase(card.mins)} 
               className="bg-gradient-to-br from-blue-900/40 to-black p-6 rounded-[2.5rem] border border-white/10 relative group cursor-pointer active:scale-95 transition-all shadow-2xl">
            <div className="flex justify-between items-end relative z-10">
              <div className="space-y-1">
                <h2 className="text-4xl font-black italic tracking-tighter leading-none">{card.mins} MINS</h2>
                <div className="pt-2">
                  <p className="text-[9px] opacity-40 uppercase font-black tracking-widest leading-none mb-1">Global Price</p>
                  <p className="text-yellow-500 font-black text-lg leading-none">${card.usd.toFixed(2)} USD</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] opacity-40 uppercase font-black tracking-widest mb-1">ብናትካ ገንዘብ ({userData.currency})</p>
                <p className="text-2xl font-black text-green-400 italic font-mono leading-none">{getLocalPrice(card.usd)}</p>
              </div>
            </div>
            <CreditCard className="absolute top-4 right-4 opacity-5 rotate-12" size={80} />
          </div>
        ))}
      </div>
    </div>
  );
};
export default BuyCard;