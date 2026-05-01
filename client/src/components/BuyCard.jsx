
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toPng } from 'html-to-image'; // እታ ስእሊ እትሰርሕ ላይብረሪ
import { ArrowLeft, CreditCard, X, ChevronRight, ShieldCheck, CheckCircle2, Download, Share2 } from "lucide-react";

const BuyCard = () => {
  const navigate = useNavigate();
  const receiptRef = useRef(null); // ነታ ርሲት ንምሓዝ ዝተወሰኸት
  const [userData, setUserData] = useState({ phone: "", currency: "USD", country: "" });
  const [liveRates, setLiveRates] = useState(null);
  const [loading, setLoading] = useState(true);

  const [selectedPackage, setSelectedPackage] = useState(null);
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  const [availableMethods, setAvailableMethods] = useState([]);
  
  const [paymentStep, setPaymentStep] = useState(1); 
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [accountNumber, setAccountNumber] = useState("");
  const [customerName, setCustomerName] = useState(""); 
  const [isProcessing, setIsProcessing] = useState(false);

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
          let countryCode = userRes.data.country;
          if (!countryCode || countryCode === "Unknown") {
            if (userPhone.startsWith("+256")) countryCode = "UG";
            else if (userPhone.startsWith("+251")) countryCode = "ET";
            else countryCode = "DEFAULT";
          }
          setUserData({ phone: userRes.data.phone, currency: userRes.data.currency || "USD", country: countryCode });

          const payRes = await axios.get(`http://localhost:5000/api/auth/payment-methods/${countryCode}`);
          if (payRes.data.success) setAvailableMethods(payRes.data.methods);
        }
        if (rateRes.data && rateRes.data.rates) setLiveRates(rateRes.data.rates);
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    fetchInitialData();
  }, []);

  const getLocalPrice = (usdPrice) => {
    if (!liveRates || !userData.currency) return usdPrice.toFixed(2); 
    const rate = liveRates[userData.currency];
    const total = usdPrice * (rate || 1);
    return Math.round(total).toLocaleString() + " " + userData.currency;
  };

  const handleSelectPackage = (pkg) => {
    setSelectedPackage(pkg);
    setPaymentStep(1);
    setShowPaymentOptions(true);
  };

  const handleSelectBank = (method) => {
    setSelectedMethod(method);
    setPaymentStep(2);
  };

  const handleFinalPurchase = async () => {
    if (!accountNumber || !customerName) return alert("በጃኻ ኩሉ ሓበሬታ ኣእቱ");
    
    setIsProcessing(true);
    try {
      const response = await axios.put('http://localhost:5000/api/auth/add-minutes', {
        phone: userData.phone,
        minutesToAdd: selectedPackage.mins
      });
      if (response.data.success) {
        setPaymentStep(3);
      }
    } catch (err) { 
      alert("Error processing payment!"); 
    } finally {
      setIsProcessing(false);
    }
  };

  // --- እታ ናይ ስእሊ (Image) Save ፋንክሽን ---
  const handleSaveReceipt = async () => {
    if (receiptRef.current === null) return;
    try {
      const dataUrl = await toPng(receiptRef.current, { pixelRatio: 3, backgroundColor: '#000' });
      const link = document.createElement('a');
      link.download = `HabeshaTele_Receipt_${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Save error:", err);
    }
  };

  // --- እታ ናይ ስእሊ (Image) Share ፋንክሽን ---
  const handleShareReceipt = async () => {
    if (receiptRef.current === null) return;
    try {
      const dataUrl = await toPng(receiptRef.current, { pixelRatio: 3, backgroundColor: '#000' });
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], 'HabeshaTele_Receipt.png', { type: 'image/png' });

      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Habesha Tele Receipt',
          text: `I just bought ${selectedPackage?.mins} minutes on Habesha Tele!`,
        });
      } else {
        alert("Share image is not supported on this browser. Try Saving it instead.");
      }
    } catch (err) {
      console.error("Share error:", err);
    }
  };

  const handleClose = () => {
    setShowPaymentOptions(false);
    if (paymentStep === 3) {
      navigate("/home", { state: { refresh: Date.now(), userPhone: userData.phone } });
    }
    setPaymentStep(1);
    setAccountNumber("");
    setCustomerName("");
  };

  const isBank = selectedMethod?.name.toLowerCase().includes("bank");
  const isCard = selectedMethod?.name.toLowerCase().includes("card");

  if (loading) return <div className="bg-[#020617] h-screen flex items-center justify-center text-white italic animate-pulse">Habesha Tele...</div>;

  return (
    <div className="fixed inset-0 bg-[#020617] text-white flex flex-col p-6 font-sans overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-start mb-8 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 bg-white/5 rounded-full"><ArrowLeft size={24}/></button>
          <div>
            <h1 className="text-xl font-black text-yellow-500 uppercase italic">Habesha Tele</h1>
            <p className="text-[10px] opacity-40 font-mono">{userData.phone}</p>
          </div>
        </div>
        <div className="text-right bg-yellow-500/10 p-2 px-3 rounded-2xl border border-yellow-500/20 text-xs font-black italic">
          1 USD = {liveRates?.[userData.currency]?.toLocaleString()} {userData.currency}
        </div>
      </div>

      {/* Packages */}
      <div className="space-y-4 overflow-y-auto scrollbar-hide pb-6">
        {packages.map((card, i) => (
          <div key={i} onClick={() => handleSelectPackage(card)} 
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

      {/* --- Full Page Checkout Process --- */}
      {showPaymentOptions && (
        <div className="fixed inset-0 bg-[#020617] z-50 flex flex-col p-6 animate-in slide-in-from-bottom duration-300">
          <div className="flex justify-between items-center mb-8">
            <button onClick={handleClose} className="p-3 bg-white/5 rounded-2xl"><X size={24}/></button>
            <h2 className="text-2xl font-black italic uppercase tracking-tighter">
              {paymentStep === 1 && "Checkout"}
              {paymentStep === 2 && "Details"}
              {paymentStep === 3 && "Receipt"}
            </h2>
            <div className="w-12"></div>
          </div>

          {/* STEP 1: SELECT METHOD */}
          {paymentStep === 1 && (
            <div className="flex flex-col h-full">
              <p className="text-sm text-center text-white/40 mb-8 uppercase font-bold tracking-widest italic text-white">
                Select Method to pay <span className="text-green-400">{getLocalPrice(selectedPackage?.usd)}</span>
              </p>
              <div className="flex-1 space-y-4 overflow-y-auto">
                {availableMethods.map((method, i) => (
                  <button key={i} onClick={() => handleSelectBank(method)}
                          className={`w-full p-6 rounded-[2rem] flex items-center justify-between border border-white/5 transition-all active:scale-[0.97] ${method.color || 'bg-white/5'}`}>
                    <div className="flex items-center gap-5">
                      <span className="text-4xl">{method.icon}</span>
                      <p className="font-black text-xl leading-none text-white">{method.name}</p>
                    </div>
                    <ChevronRight size={24} className="opacity-40 text-white" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: DYNAMIC INPUT INFO */}
          {paymentStep === 2 && (
            <div className="flex flex-col items-center justify-center flex-1">
              <div className={`p-8 rounded-[3rem] w-full border border-white/10 ${selectedMethod?.color} bg-opacity-10 backdrop-blur-xl shadow-2xl`}>
                <div className="text-center mb-8">
                  <span className="text-6xl mb-4 block animate-bounce">{selectedMethod?.icon}</span>
                  <h3 className="text-2xl font-black italic uppercase text-yellow-500 tracking-tighter">{selectedMethod?.name}</h3>
                </div>
                
                <div className="space-y-4">
                  <input 
                    type="text"
                    placeholder="Full Name (ምሉእ ስም)"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-black/60 border border-white/10 p-5 rounded-2xl text-center text-lg font-bold outline-none focus:border-yellow-500 transition-all text-white"
                  />
                  
                  <input 
                    autoFocus
                    type="text"
                    placeholder={isBank ? "Bank Account Number" : isCard ? "Card Number (16 digits)" : "Phone Number"}
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    className="w-full bg-black/60 border border-white/20 p-5 rounded-2xl text-center text-xl font-bold outline-none focus:border-yellow-500 transition-all text-white"
                  />
                </div>

                <button 
                  onClick={handleFinalPurchase}
                  disabled={isProcessing}
                  className="w-full bg-yellow-500 text-black font-black p-5 rounded-2xl mt-8 uppercase italic shadow-xl shadow-yellow-500/20 active:scale-95 transition-all"
                >
                  {isProcessing ? "Processing..." : "Confirm & Pay Now"}
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: HABESHA TELE STYLE RECEIPT (OPTIMIZED) */}
          {paymentStep === 3 && (
            <div className="flex flex-col items-center justify-center flex-1">
              {/* እዛ Ref እያ ነቲ ስእሊ እትሰርሖ */}
              <div ref={receiptRef} className="bg-black w-full rounded-[3.5rem] p-6 border-2 border-yellow-500/30 shadow-[0_0_80px_rgba(234,179,8,0.15)] relative overflow-hidden flex flex-col items-center">
                
                <div className="flex flex-col items-center mb-4">
                  <div className="bg-yellow-500/10 p-4 rounded-full mb-2 border border-yellow-500/20">
                    <CheckCircle2 size={40} className="text-yellow-500" />
                  </div>
                  <h3 className="text-3xl font-black italic uppercase tracking-tighter text-yellow-500 leading-none">Confirmed</h3>
                  <p className="text-[10px] font-black opacity-30 uppercase tracking-[0.4em] mt-1 italic text-white leading-none">Payment Receipt</p>
                </div>

                {/* --- ጽሑፍ የማንን ጸጋምን ተረሓሒቑ --- */}
                <div className="w-full space-y-[14px] py-4 px-6"> 
                  <div className="flex justify-between items-center">
                    <span className="opacity-60 uppercase font-black text-white text-[12px]">Package</span>
                    <span className="font-black text-yellow-500 italic uppercase text-[16px] leading-none">{selectedPackage?.mins} Minutes</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="opacity-60 uppercase font-black text-white text-[12px]">Customer</span>
                    <span className="font-black text-white text-[14px] uppercase">{customerName}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="opacity-60 uppercase font-black text-white text-[12px]">{isBank ? "Account" : "Number"}</span>
                    <span className="font-black italic text-white text-[14px]">{accountNumber}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="opacity-60 uppercase font-black text-white text-[12px]">Method</span>
                    <div className="flex items-center gap-2">
                      <span>{selectedMethod?.icon}</span>
                      <span className="font-black text-white text-[14px] uppercase">{selectedMethod?.name}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-white/10">
                    <span className="font-black uppercase italic text-yellow-500 text-[13px]">Total Paid</span>
                    <span className="text-3xl font-black text-green-400 font-mono leading-none">{getLocalPrice(selectedPackage?.usd)}</span>
                  </div>
                </div>

                <p className="mt-2 text-[7px] opacity-20 font-black uppercase tracking-[0.4em] italic text-white text-center">Habesha Tele Official Systems</p>
              </div>

              {/* Action Buttons - Compact */}
              <div className="mt-5 grid grid-cols-2 gap-4 w-full">
                <button onClick={handleSaveReceipt} className="bg-white/5 p-4 rounded-2xl flex items-center justify-center gap-2 border border-white/5 hover:bg-white/10 font-black text-[10px] uppercase italic text-white">
                  <Download size={16}/> Save
                </button>
                <button onClick={handleShareReceipt} className="bg-white/5 p-4 rounded-2xl flex items-center justify-center gap-2 border border-white/5 hover:bg-white/10 font-black text-[10px] uppercase italic text-white">
                  <Share2 size={16}/> Share
                </button>
              </div>
              
              <button onClick={handleClose} className="w-full mt-4 bg-yellow-500 text-black p-4 rounded-3xl font-black uppercase italic text-xs tracking-widest active:scale-95 transition-all shadow-lg">
                Back to Home
              </button>
            </div>
          )}

          {/* Footer Security */}
          {paymentStep !== 3 && (
            <div className="mt-auto flex items-center justify-center gap-2 opacity-20">
              <ShieldCheck size={14} />
              <p className="text-[9px] uppercase font-black tracking-widest italic text-white">Encrypted Secure Node</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BuyCard;