
// import React, { useState, useEffect, useRef } from "react";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";
// import { toPng } from 'html-to-image'; // እታ ስእሊ እትሰርሕ ላይብረሪ
// import { ArrowLeft, CreditCard, X, ChevronRight, ShieldCheck, CheckCircle2, Download, Share2 } from "lucide-react";
// import { parsePhoneNumberFromString } from 'libphonenumber-js';

// const BuyCard = () => {
//   const navigate = useNavigate();
//   const receiptRef = useRef(null); // ነታ ርሲት ንምሓዝ ዝተወሰኸት
//   const [userData, setUserData] = useState({ phone: "", currency: "USD", country: "" });
//   const [liveRates, setLiveRates] = useState(null);
//   const [loading, setLoading] = useState(true);

//   const [selectedPackage, setSelectedPackage] = useState(null);
//   const [showPaymentOptions, setShowPaymentOptions] = useState(false);
//   const [availableMethods, setAvailableMethods] = useState([]);
  
//   const [paymentStep, setPaymentStep] = useState(1); 
//   const [selectedMethod, setSelectedMethod] = useState(null);
//   const [accountNumber, setAccountNumber] = useState("");
//   const [customerName, setCustomerName] = useState(""); 
//   const [isProcessing, setIsProcessing] = useState(false);

//   const packages = [
//     { mins: 15, usd: 3.00 },
//     { mins: 25, usd: 6.00 },
//     { mins: 60, usd: 12.00 }
//   ];

//   // 🔄 ዝተስተኻኸለ useEffect (ብዘይ Warnings ንኹሉ ዳታ ብትኽክል የውጽእ)
//   useEffect(() => {
//     const fetchInitialData = async () => {
//       try {
//         const userPhone = localStorage.getItem("userPhone");
//         if (!userPhone) return navigate("/login");

//         const userRes = await axios.get(`https://habesha-phone-call-4.onrender.com/api/auth/current-user?phone=${encodeURIComponent(userPhone)}`);

//         if (userRes.data.success) {
//           const currency = userRes.data.currency || "USD";
//           const phoneNumber = parsePhoneNumberFromString(userPhone);
//           const countryCode = phoneNumber ? phoneNumber.country : "DEFAULT"; 

//           setUserData({ phone: userRes.data.phone, currency: currency, country: countryCode });

//           // 1. ዝተሰማምዐ Payment Methods ምውጻእ
//           const payRes = await axios.get(`https://habesha-phone-call-4.onrender.com/api/auth/payment-methods/${countryCode}`);
//           if (payRes.data.success) {
//               setAvailableMethods(payRes.data.methods);
//           }

//           // 2. ዋጋ ሬት ምውጻእ
//           const adminRateRes = await axios.get(`https://habesha-phone-call-4.onrender.com/api/auth/get-current-rate/${currency}`);
//           const adminSettings = adminRateRes.data.settings;

//           if (adminSettings) {
//             setLiveRates({ [currency]: adminSettings.manualRate });
//           } else {
//             setLiveRates({ [currency]: 1 });
//           }
//         }
//       } catch (err) { 
//         console.error("❌ BuyCard Fetch Error:", err); 
//       } finally { 
//         setLoading(false); 
//       }
//     };

//     fetchInitialData();
//   }, [navigate]);

//   const getLocalPrice = (usdPrice) => {
//     if (!liveRates || !userData.currency) return usdPrice.toFixed(2); 
//     const rate = liveRates[userData.currency];
//     const total = usdPrice * (rate || 1);
//     return Math.round(total).toLocaleString() + " " + userData.currency;
//   };

//   const handleSelectPackage = (pkg) => {
//     setSelectedPackage(pkg);
//     setPaymentStep(1);
//     setShowPaymentOptions(true);
//   };

//   const handleSelectBank = (method) => {
//     setSelectedMethod(method);
//     setPaymentStep(2);
//   };

//   const handleFinalPurchase = async () => {
//     if (!accountNumber || !customerName) return alert("በጃኻ ኩሉ ሓበሬታ ኣእቱ");
    
//     setIsProcessing(true);
//     try {
//       const response = await axios.put('https://habesha-phone-call-4.onrender.com/api/auth/add-minutes', {
//         phone: userData.phone,
//         minutesToAdd: selectedPackage.mins
//       });
//       if (response.data.success) {
//         setPaymentStep(3);
//       }
//     } catch (err) { 
//       alert("Error processing payment! Please try again."); 
//     } finally {
//       setIsProcessing(false);
//     }
//   };

//   // --- እታ ናይ ስእሊ (Image) Save ፋንክሽን ---
//   const handleSaveReceipt = async () => {
//     if (receiptRef.current === null) return;
//     try {
//       const dataUrl = await toPng(receiptRef.current, { pixelRatio: 3, backgroundColor: '#000' });
//       const link = document.createElement('a');
//       link.download = `HabeshaTele_Receipt_${Date.now()}.png`;
//       link.href = dataUrl;
//       link.click();
//     } catch (err) {
//       console.error("Save error:", err);
//     }
//   };

//   // --- እታ ናይ ስእሊ (Image) Share ፋንክሽን ---
//   const handleShareReceipt = async () => {
//     if (receiptRef.current === null) return;
//     try {
//       const dataUrl = await toPng(receiptRef.current, { pixelRatio: 3, backgroundColor: '#000' });
//       const blob = await (await fetch(dataUrl)).blob();
//       const file = new File([blob], 'HabeshaTele_Receipt.png', { type: 'image/png' });

//       if (navigator.share && navigator.canShare({ files: [file] })) {
//         await navigator.share({
//           files: [file],
//           title: 'Habesha Tele Receipt',
//           text: `I just bought ${selectedPackage?.mins} minutes on Habesha Tele!`,
//         });
//       } else {
//         alert("Share image is not supported on this browser. Try Saving it instead.");
//       }
//     } catch (err) {
//       console.error("Share error:", err);
//     }
//   };

//   const handleClose = () => {
//     setShowPaymentOptions(false);
//     if (paymentStep === 3) {
//       navigate("/home", { state: { refresh: Date.now(), userPhone: userData.phone } });
//     }
//     setPaymentStep(1);
//     setAccountNumber("");
//     setCustomerName("");
//   };

//   const isBank = selectedMethod?.name.toLowerCase().includes("bank");
//   const isCard = selectedMethod?.name.toLowerCase().includes("card");

//   if (loading) return <div className="bg-[#020617] h-screen flex items-center justify-center text-white italic animate-pulse">Habesha Tele...</div>;

//   return (
//     <div className="fixed inset-0 bg-[#020617] text-white flex flex-col p-6 font-sans overflow-hidden">
//       {/* Header */}
//       <div className="flex justify-between items-start mb-8 border-b border-white/10 pb-4">
//         <div className="flex items-center gap-3">
//           <button onClick={() => navigate(-1)} className="p-2 bg-white/5 rounded-full"><ArrowLeft size={24}/></button>
//           <div>
//             <h1 className="text-xl font-black text-yellow-500 uppercase italic">Habesha Tele</h1>
//             <p className="text-[10px] opacity-40 font-mono">{userData.phone}</p>
//           </div>
//         </div>
//         <div className="text-right bg-yellow-500/10 p-2 px-3 rounded-2xl border border-yellow-500/20 text-xs font-black italic">
//           1 USD = {liveRates?.[userData.currency]?.toLocaleString()} {userData.currency}
//         </div>
//       </div>

//       {/* Packages */}
//       <div className="space-y-4 overflow-y-auto scrollbar-hide pb-6">
//         {packages.map((card, i) => (
//           <div key={i} onClick={() => handleSelectPackage(card)} 
//                className="bg-gradient-to-br from-blue-900/40 to-black p-6 rounded-[2.5rem] border border-white/10 relative group cursor-pointer active:scale-95 transition-all shadow-2xl">
//             <div className="flex justify-between items-end relative z-10">
//               <div className="space-y-1">
//                 <h2 className="text-4xl font-black italic tracking-tighter leading-none">{card.mins} MINS</h2>
//                 <div className="pt-2">
//                   <p className="text-[9px] opacity-40 uppercase font-black tracking-widest leading-none mb-1">Global Price</p>
//                   <p className="text-yellow-500 font-black text-lg leading-none">${card.usd.toFixed(2)} USD</p>
//                 </div>
//               </div>
//               <div className="text-right">
//                 <p className="text-[10px] opacity-40 uppercase font-black tracking-widest mb-1">ብትጥቀሙሉ ገንዘብ ({userData.currency})</p>
//                 <p className="text-2xl font-black text-green-400 italic font-mono leading-none">{getLocalPrice(card.usd)}</p>
//               </div>
//             </div>
//             <CreditCard className="absolute top-4 right-4 opacity-5 rotate-12" size={80} />
//           </div>
//         ))}
//       </div>

//       {/* --- Full Page Checkout Process --- */}
//       {showPaymentOptions && (
//         <div className="fixed inset-0 bg-[#020617] z-50 flex flex-col p-6 animate-in slide-in-from-bottom duration-300">
//           <div className="flex justify-between items-center mb-8">
//             <button onClick={handleClose} className="p-3 bg-white/5 rounded-2xl"><X size={24}/></button>
//             <h2 className="text-2xl font-black italic uppercase tracking-tighter">
//               {paymentStep === 1 && "Checkout"}
//               {paymentStep === 2 && "Details"}
//               {paymentStep === 3 && "Receipt"}
//             </h2>
//             <div className="w-12"></div>
//           </div>

//           {/* STEP 1: SELECT METHOD */}
//           {paymentStep === 1 && (
//             <div className="flex flex-col h-full">
//               <p className="text-sm text-center text-white/40 mb-8 uppercase font-bold tracking-widest italic">
//                 Select Method to pay <span className="text-green-400">{getLocalPrice(selectedPackage?.usd)}</span>
//               </p>
//               <div className="flex-1 space-y-4 overflow-y-auto">
//                 {availableMethods.map((method, i) => (
//                   <button key={i} onClick={() => handleSelectBank(method)}
//                           className={`w-full p-6 rounded-[2rem] flex items-center justify-between border border-white/5 transition-all active:scale-[0.97] ${method.color || 'bg-white/5'}`}>
//                     <div className="flex items-center gap-5">
//                       <span className="text-4xl">{method.icon}</span>
//                       <p className="font-black text-xl leading-none text-white">{method.name}</p>
//                     </div>
//                     <ChevronRight size={24} className="opacity-40 text-white" />
//                   </button>
//                 ))}
//               </div>
//             </div>
//           )}

//           {/* STEP 2: DYNAMIC INPUT INFO */}
//           {paymentStep === 2 && (
//             <div className="flex flex-col items-center justify-center flex-1">
//               <div className={`p-8 rounded-[3rem] w-full border border-white/10 ${selectedMethod?.color} bg-opacity-10 backdrop-blur-xl shadow-2xl`}>
//                 <div className="text-center mb-8">
//                   <span className="text-6xl mb-4 block animate-bounce">{selectedMethod?.icon}</span>
//                   <h3 className="text-2xl font-black italic uppercase text-yellow-500 tracking-tighter">{selectedMethod?.name}</h3>
//                 </div>
                
//                 <div className="space-y-4">
//                   <input 
//                     type="text"
//                     placeholder="Full Name (ምሉእ ስም)"
//                     value={customerName}
//                     onChange={(e) => setCustomerName(e.target.value)}
//                     className="w-full bg-black/60 border border-white/10 p-5 rounded-2xl text-center text-lg font-bold outline-none focus:border-yellow-500 transition-all text-white"
//                   />
                  
//                   <input 
//                     autoFocus
//                     type="text"
//                     placeholder={isBank ? "Bank Account Number" : isCard ? "Card Number (16 digits)" : "Phone Number"}
//                     value={accountNumber}
//                     onChange={(e) => setAccountNumber(e.target.value)}
//                     className="w-full bg-black/60 border border-white/20 p-5 rounded-2xl text-center text-xl font-bold outline-none focus:border-yellow-500 transition-all text-white"
//                   />
//                 </div>

//                 <button 
//                   onClick={handleFinalPurchase}
//                   disabled={isProcessing}
//                   className="w-full bg-yellow-500 text-black font-black p-5 rounded-2xl mt-8 uppercase italic shadow-xl shadow-yellow-500/20 active:scale-95 transition-all"
//                 >
//                   {isProcessing ? "Processing..." : "Confirm & Pay Now"}
//                 </button>
//               </div>
//             </div>
//           )}

//           {/* STEP 3: HABESHA TELE STYLE RECEIPT */}
//           {paymentStep === 3 && (
//             <div className="flex flex-col items-center justify-center flex-1">
//               <div ref={receiptRef} className="bg-black w-full rounded-[3.5rem] p-6 border-2 border-yellow-500/30 shadow-[0_0_80px_rgba(234,179,8,0.15)] relative overflow-hidden flex flex-col items-center">
                
//                 <div className="flex flex-col items-center mb-4">
//                   <div className="bg-yellow-500/10 p-4 rounded-full mb-2 border border-yellow-500/20">
//                     <CheckCircle2 size={40} className="text-yellow-500" />
//                   </div>
//                   <h3 className="text-3xl font-black italic uppercase tracking-tighter text-yellow-500 leading-none">Confirmed</h3>
//                   <p className="text-[10px] font-black opacity-30 uppercase tracking-[0.4em] mt-1 italic text-white leading-none">Payment Receipt</p>
//                 </div>

//                 <div className="w-full space-y-[14px] py-4 px-6"> 
//                   <div className="flex justify-between items-center">
//                     <span className="opacity-60 uppercase font-black text-white text-[12px]">Package</span>
//                     <span className="font-black text-yellow-500 italic uppercase text-[16px] leading-none">{selectedPackage?.mins} Minutes</span>
//                   </div>
                  
//                   <div className="flex justify-between items-center">
//                     <span className="opacity-60 uppercase font-black text-white text-[12px]">Customer</span>
//                     <span className="font-black text-white text-[14px] uppercase">{customerName}</span>
//                   </div>

//                   <div className="flex justify-between items-center">
//                     <span className="opacity-60 uppercase font-black text-white text-[12px]">Identity</span>
//                     <span className="font-black italic text-white text-[14px]">{accountNumber}</span>
//                   </div>

//                   <div className="flex justify-between items-center">
//                     <span className="opacity-60 uppercase font-black text-white text-[12px]">Method</span>
//                     <div className="flex items-center gap-2">
//                       <span>{selectedMethod?.icon}</span>
//                       <span className="font-black text-white text-[14px] uppercase">{selectedMethod?.name}</span>
//                     </div>
//                   </div>

//                   <div className="flex justify-between items-center pt-4 border-t border-white/10">
//                     <span className="font-black uppercase italic text-yellow-500 text-[13px]">Total Paid</span>
//                     <span className="text-3xl font-black text-green-400 font-mono leading-none">{getLocalPrice(selectedPackage?.usd)}</span>
//                   </div>
//                 </div>

//                 <p className="mt-2 text-[7px] opacity-20 font-black uppercase tracking-[0.4em] italic text-white text-center">Habesha Tele Official Systems</p>
//               </div>

//               <div className="mt-5 grid grid-cols-2 gap-4 w-full">
//                 <button onClick={handleSaveReceipt} className="bg-white/5 p-4 rounded-2xl flex items-center justify-center gap-2 border border-white/5 hover:bg-white/10 font-black text-[10px] uppercase italic text-white">
//                   <Download size={16}/> Save
//                 </button>
//                 <button onClick={handleShareReceipt} className="bg-white/5 p-4 rounded-2xl flex items-center justify-center gap-2 border border-white/5 hover:bg-white/10 font-black text-[10px] uppercase italic text-white">
//                   <Share2 size={16}/> Share
//                 </button>
//               </div>
              
//               <button onClick={handleClose} className="w-full mt-4 bg-yellow-500 text-black p-4 rounded-3xl font-black uppercase italic text-xs tracking-widest active:scale-95 transition-all shadow-lg">
//                 Back to Home
//               </button>
//             </div>
//           )}

//           {/* Footer Security */}
//           {paymentStep !== 3 && (
//             <div className="mt-auto flex items-center justify-center gap-2 opacity-20">
//               <ShieldCheck size={14} />
//               <p className="text-[9px] uppercase font-black tracking-widest italic text-white">Encrypted Secure Node</p>
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// };

// export default BuyCard;

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toPng } from "html-to-image";
import {
  ArrowLeft,
  CreditCard,
  X,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Download,
  Share2,
  Loader2
} from "lucide-react";
import { parsePhoneNumberFromString } from "libphonenumber-js";

const API = "https://habesha-phone-call-4.onrender.com/api";

const BuyCard = () => {
  const navigate = useNavigate();
  const receiptRef = useRef(null);
  const verificationStarted = useRef(false);

  const [userData, setUserData] = useState({
    phone: "",
    email: "",
    currency: "USD",
    country: "INTL"
  });

  const [liveRates, setLiveRates] = useState(null);
  const [loading, setLoading] = useState(true);

  const [selectedPackage, setSelectedPackage] = useState(null);
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  const [availableMethods, setAvailableMethods] = useState([]);

  const [paymentStep, setPaymentStep] = useState(1);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const [paymentId, setPaymentId] = useState("");
  const [paymentMessage, setPaymentMessage] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");

  const packages = [
    {
      id: "15-minutes",
      mins: 15,
      usd: 3.00
    },
    {
      id: "25-minutes",
      mins: 25,
      usd: 6.00
    },
    {
      id: "60-minutes",
      mins: 60,
      usd: 12.00
    }
  ];

  // --------------------------------------------------
  // AUTHENTICATION
  // --------------------------------------------------

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      throw new Error("Your session has expired. Please log in again.");
    }

    return {
      Authorization: `Bearer ${token}`
    };
  }, [navigate]);

  // --------------------------------------------------
  // PAYMENT METHODS
  // --------------------------------------------------

  const getMethodsForCountry = useCallback(async (country) => {
    if (country === "ET") {
      return [
        {
          id: "telebirr",
          provider: "chapa",
          name: "Telebirr",
          icon: "📱",
          color: "bg-blue-900/30"
        }
      ];
    }

    if (country === "UG") {
      return [
        {
          id: "mobilemoneyuganda",
          provider: "flutterwave",
          name: "MTN / Airtel Mobile Money",
          icon: "📱",
          color: "bg-yellow-900/20"
        }
      ];
    }

    if (country === "KE") {
      return [
        {
          id: "mpesa",
          provider: "flutterwave",
          name: "M-Pesa",
          icon: "📱",
          color: "bg-green-900/20"
        }
      ];
    }

    // International customers: show only configured providers.
    const response = await axios.get(`${API}/payments/packages`);

    const providers = response.data?.providers || [];

    const methods = [];

    const isAvailable = (provider) =>
      providers.some(
        (item) => item.id === provider && item.available === true
      );

    if (isAvailable("stripe")) {
      methods.push({
        id: "stripe-card",
        provider: "stripe",
        name: "Credit / Debit Card",
        icon: "💳",
        color: "bg-blue-900/30"
      });
    }

    if (isAvailable("flutterwave")) {
      methods.push({
        id: "flutterwave-card",
        provider: "flutterwave",
        name: "International Card",
        icon: "💳",
        color: "bg-purple-900/30"
      });
    }

    if (isAvailable("paypal")) {
      methods.push({
        id: "paypal",
        provider: "paypal",
        name: "PayPal",
        icon: "🌐",
        color: "bg-blue-800/30"
      });
    }

    return methods;
  }, []);

  // --------------------------------------------------
  // EXCHANGE RATE FOR DISPLAY ONLY
  // Backend calculates the real checkout amount.
  // --------------------------------------------------

  const fetchDisplayRate = async (currency) => {
    if (!currency || currency === "USD") {
      setLiveRates({ USD: 1 });
      return;
    }

    try {
      const response = await axios.get(
        `${API}/auth/get-current-rate/${currency}`
      );

      const data = response.data || {};

      const possibleRate =
        data.rate ??
        data.exchangeRate ??
        data.manualRate ??
        data.settings?.manualRate;

      const rate = Number(possibleRate);

      if (
        Number.isFinite(rate) &&
        rate > 0
      ) {
        setLiveRates({
          [currency]: rate
        });
      } else {
        // Do not show a false exchange rate of 1.
        setLiveRates(null);
      }
    } catch (error) {
      console.error("Exchange rate error:", error);
      setLiveRates(null);
    }
  };

  // --------------------------------------------------
  // VERIFY PAYMENT AFTER RETURN FROM PROVIDER
  // --------------------------------------------------

  const verifyReturnedPayment = useCallback(async (
    returnedPaymentId,
    transactionId
  ) => {
    if (!returnedPaymentId) return;

    try {
      setPaymentId(returnedPaymentId);
      setShowPaymentOptions(true);
      setPaymentStep(2);
      setIsProcessing(true);
      setPaymentMessage("Verifying your payment...");
      setPaymentStatus("checking");

      const headers = getAuthHeaders();

      let verifyUrl =
        `${API}/payments/verify/${encodeURIComponent(returnedPaymentId)}`;

      if (transactionId) {
        verifyUrl += `?transaction_id=${encodeURIComponent(transactionId)}`;
      }

      const response = await axios.get(verifyUrl, { headers });

      if (response.data?.paid === true) {
        const purchasedMinutes = Number(response.data.minutes);

        const matchedPackage = packages.find(
          (item) => item.mins === purchasedMinutes
        );

        if (matchedPackage) {
          setSelectedPackage(matchedPackage);
        }

        setPaymentStatus("paid");
        setPaymentMessage("Your payment has been confirmed.");
        setPaymentStep(3);

        return;
      }

      setPaymentStatus("pending");
      setPaymentMessage(
        response.data?.msg ||
        "Your payment is not confirmed yet. Please check again."
      );
    } catch (error) {
      console.error("Payment verification error:", error);

      setPaymentStatus("error");
      setPaymentMessage(
        error.response?.data?.msg ||
        "We could not verify your payment. Please try again."
      );
    } finally {
      setIsProcessing(false);
    }
  }, [getAuthHeaders]);

  // --------------------------------------------------
  // FETCH USER DATA
  // --------------------------------------------------

  useEffect(() => {
    let isMounted = true;

    const fetchInitialData = async () => {
      try {
        const userPhone = localStorage.getItem("userPhone");
        const token = localStorage.getItem("token");

        if (!userPhone || !token) {
          navigate("/login");
          return;
        }

        const headers = {
          Authorization: `Bearer ${token}`
        };

        const userRes = await axios.get(
          `${API}/auth/current-user?phone=${encodeURIComponent(userPhone)}`,
          { headers }
        );

        if (!userRes.data?.success) {
          throw new Error("Could not load your account.");
        }

        const phoneNumber = parsePhoneNumberFromString(userPhone);

        const countryCode = phoneNumber?.country || "INTL";

        const currencyByCountry = {
          ET: "ETB",
          UG: "UGX",
          KE: "KES"
        };

        const currency =
          currencyByCountry[countryCode] ||
          userRes.data.currency ||
          "USD";

        if (!isMounted) return;

        setUserData({
          phone: userRes.data.phone || userPhone,
          email: userRes.data.email || "",
          currency,
          country: countryCode
        });

        // Load the payment methods available for this country.
        const methods = await getMethodsForCountry(countryCode);

        if (!isMounted) return;

        setAvailableMethods(methods);

        // Exchange rate is only for showing an estimated price.
        await fetchDisplayRate(currency);

        // If the provider redirected the customer back,
        // verify the payment automatically.
        const params = new URLSearchParams(window.location.search);

        const returnedPaymentId = params.get("paymentId");
        const transactionId = params.get("transaction_id");

        if (
          returnedPaymentId &&
          !verificationStarted.current
        ) {
          verificationStarted.current = true;

          await verifyReturnedPayment(
            returnedPaymentId,
            transactionId
          );
        }
      } catch (error) {
        console.error("BuyCard Fetch Error:", error);

        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
          return;
        }

        alert(
          error.response?.data?.msg ||
          error.message ||
          "Could not load your payment information."
        );
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchInitialData();

    return () => {
      isMounted = false;
    };
  }, [
    navigate,
    getMethodsForCountry,
    verifyReturnedPayment
  ]);

  // --------------------------------------------------
  // DISPLAY PRICE
  // --------------------------------------------------

  const getLocalPrice = (usdPrice) => {
    if (!usdPrice) return "--";

    if (userData.currency === "USD") {
      return `$${usdPrice.toFixed(2)} USD`;
    }

    const rate = liveRates?.[userData.currency];

    if (!rate) {
      return "Rate unavailable";
    }

    const total = usdPrice * rate;

    return `${Math.round(total).toLocaleString()} ${userData.currency}`;
  };

  // --------------------------------------------------
  // SELECT PACKAGE
  // --------------------------------------------------

  const handleSelectPackage = (pkg) => {
    if (!availableMethods.length) {
      alert(
        "No payment method is currently available for your country."
      );
      return;
    }

    setSelectedPackage(pkg);
    setSelectedMethod(null);
    setPaymentId("");
    setPaymentMessage("");
    setPaymentStatus("");
    setPaymentStep(1);
    setShowPaymentOptions(true);
  };

  // --------------------------------------------------
  // SELECT PAYMENT METHOD
  // --------------------------------------------------

  const handleSelectMethod = (method) => {
    setSelectedMethod(method);
    setPaymentStep(2);
    setPaymentMessage("");
    setPaymentStatus("");
  };

  // --------------------------------------------------
  // CREATE SECURE CHECKOUT
  // --------------------------------------------------

  const handleFinalPurchase = async () => {
    if (!selectedPackage || !selectedMethod) {
      alert("Please select a package and payment method.");
      return;
    }

    if (isProcessing) return;

    setIsProcessing(true);
    setPaymentMessage("Connecting to secure payment...");
    setPaymentStatus("checking");

    try {
      const headers = getAuthHeaders();

      const idempotencyKey =
        typeof crypto !== "undefined" &&
        typeof crypto.randomUUID === "function"
          ? crypto.randomUUID()
          : `HT-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;

      const response = await axios.post(
        `${API}/payments/checkout`,
        {
          packageId: selectedPackage.id,
          provider: selectedMethod.provider
        },
        {
          headers: {
            ...headers,
            "Idempotency-Key": idempotencyKey
          }
        }
      );

      const checkoutUrl = response.data?.checkoutUrl;

      if (
        !response.data?.success ||
        !checkoutUrl
      ) {
        throw new Error(
          response.data?.msg ||
          "The payment provider did not return a checkout link."
        );
      }

      // Only redirect to secure HTTPS checkout URLs.
      const checkout = new URL(checkoutUrl);

      if (checkout.protocol !== "https:") {
        throw new Error("The payment checkout URL is not secure.");
      }

      setPaymentId(response.data.paymentId || "");

      // Customer completes payment on the provider's hosted page.
      window.location.assign(checkout.toString());
    } catch (error) {
      console.error("Checkout Error:", error);

      setPaymentStatus("error");
      setPaymentMessage(
        error.response?.data?.msg ||
        error.message ||
        "Could not start payment. Please try again."
      );

      setIsProcessing(false);
    }
  };

  // --------------------------------------------------
  // RETRY PAYMENT VERIFICATION
  // --------------------------------------------------

  const handleRetryVerification = async () => {
    if (!paymentId) {
      setPaymentMessage(
        "Payment reference is missing. Please contact support."
      );
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const transactionId = params.get("transaction_id");

    await verifyReturnedPayment(paymentId, transactionId);
  };

  // --------------------------------------------------
  // SAVE RECEIPT
  // --------------------------------------------------

  const handleSaveReceipt = async () => {
    if (!receiptRef.current) return;

    try {
      const dataUrl = await toPng(receiptRef.current, {
        pixelRatio: 3,
        backgroundColor: "#000"
      });

      const link = document.createElement("a");

      link.download =
        `HabeshaTele_Receipt_${Date.now()}.png`;

      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Save receipt error:", error);
      alert("Could not save the receipt. Please try again.");
    }
  };

  // --------------------------------------------------
  // SHARE RECEIPT
  // --------------------------------------------------

  const handleShareReceipt = async () => {
    if (!receiptRef.current) return;

    try {
      const dataUrl = await toPng(receiptRef.current, {
        pixelRatio: 3,
        backgroundColor: "#000"
      });

      const blob = await (await fetch(dataUrl)).blob();

      const file = new File(
        [blob],
        "HabeshaTele_Receipt.png",
        { type: "image/png" }
      );

      if (
        navigator.share &&
        navigator.canShare &&
        navigator.canShare({ files: [file] })
      ) {
        await navigator.share({
          files: [file],
          title: "Habesha Tele Receipt",
          text: `I just bought ${selectedPackage?.mins} minutes on Habesha Tele!`
        });
      } else {
        alert(
          "Image sharing is not supported on this browser. Please save the receipt instead."
        );
      }
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error("Share receipt error:", error);
        alert("Could not share the receipt.");
      }
    }
  };

  // --------------------------------------------------
  // CLOSE CHECKOUT
  // --------------------------------------------------

  const handleClose = () => {
    const wasPaid = paymentStatus === "paid";

    setShowPaymentOptions(false);
    setPaymentStep(1);
    setSelectedMethod(null);
    setPaymentMessage("");
    setPaymentStatus("");
    setPaymentId("");

    if (wasPaid) {
      navigate("/home", {
        state: {
          refresh: Date.now(),
          userPhone: userData.phone
        }
      });
    }
  };

  // --------------------------------------------------
  // BACK TO PAYMENT METHODS
  // --------------------------------------------------

  const handleBackToMethods = () => {
    if (isProcessing) return;

    setPaymentStep(1);
    setSelectedMethod(null);
    setPaymentMessage("");
    setPaymentStatus("");
  };

  // --------------------------------------------------
  // LOADING SCREEN
  // --------------------------------------------------

  if (loading) {
    return (
      <div className="bg-[#020617] h-screen flex items-center justify-center text-white italic animate-pulse">
        Habesha Tele...
      </div>
    );
  }

  // --------------------------------------------------
  // MAIN UI
  // --------------------------------------------------

  return (
    <div className="fixed inset-0 bg-[#020617] text-white flex flex-col p-6 font-sans overflow-hidden">

      {/* HEADER */}

      <div className="flex justify-between items-start mb-8 border-b border-white/10 pb-4">

        <div className="flex items-center gap-3">

          <button
            onClick={() => navigate(-1)}
            className="p-2 bg-white/5 rounded-full"
          >
            <ArrowLeft size={24} />
          </button>

          <div>
            <h1 className="text-xl font-black text-yellow-500 uppercase italic">
              Habesha Tele
            </h1>

            <p className="text-[10px] opacity-40 font-mono">
              {userData.phone}
            </p>
          </div>

        </div>

        <div className="text-right bg-yellow-500/10 p-2 px-3 rounded-2xl border border-yellow-500/20 text-xs font-black italic">

          {userData.currency === "USD" ? (
            "USD"
          ) : liveRates?.[userData.currency] ? (
            <>
              1 USD ={" "}
              {liveRates[userData.currency].toLocaleString()}{" "}
              {userData.currency}
            </>
          ) : (
            "Exchange rate unavailable"
          )}

        </div>

      </div>

      {/* PACKAGES */}

      <div className="space-y-4 overflow-y-auto scrollbar-hide pb-6">

        {packages.map((card) => (

          <div
            key={card.id}
            onClick={() => handleSelectPackage(card)}
            className="bg-gradient-to-br from-blue-900/40 to-black p-6 rounded-[2.5rem] border border-white/10 relative group cursor-pointer active:scale-95 transition-all shadow-2xl"
          >

            <div className="flex justify-between items-end relative z-10">

              <div className="space-y-1">

                <h2 className="text-4xl font-black italic tracking-tighter leading-none">
                  {card.mins} MINS
                </h2>

                <div className="pt-2">

                  <p className="text-[9px] opacity-40 uppercase font-black tracking-widest leading-none mb-1">
                    Global Price
                  </p>

                  <p className="text-yellow-500 font-black text-lg leading-none">
                    ${card.usd.toFixed(2)} USD
                  </p>

                </div>

              </div>

              <div className="text-right">

                <p className="text-[10px] opacity-40 uppercase font-black tracking-widest mb-1">
                  Local Price ({userData.currency})
                </p>

                <p className="text-2xl font-black text-green-400 italic font-mono leading-none">
                  {getLocalPrice(card.usd)}
                </p>

              </div>

            </div>

            <CreditCard
              className="absolute top-4 right-4 opacity-5 rotate-12"
              size={80}
            />

          </div>

        ))}

      </div>

      {/* CHECKOUT MODAL */}

      {showPaymentOptions && (

        <div className="fixed inset-0 bg-[#020617] z-50 flex flex-col p-6 animate-in slide-in-from-bottom duration-300">

          {/* CHECKOUT HEADER */}

          <div className="flex justify-between items-center mb-8">

            <button
              onClick={handleClose}
              className="p-3 bg-white/5 rounded-2xl"
              disabled={isProcessing}
            >
              <X size={24} />
            </button>

            <h2 className="text-2xl font-black italic uppercase tracking-tighter">

              {paymentStep === 1 && "Checkout"}
              {paymentStep === 2 && "Secure Payment"}
              {paymentStep === 3 && "Receipt"}

            </h2>

            <div className="w-12"></div>

          </div>

          {/* STEP 1: SELECT PAYMENT METHOD */}

          {paymentStep === 1 && (

            <div className="flex flex-col h-full">

              <p className="text-sm text-center text-white/40 mb-8 uppercase font-bold tracking-widest italic">

                Select Method to pay{" "}

                <span className="text-green-400">
                  {getLocalPrice(selectedPackage?.usd)}
                </span>

              </p>

              <div className="flex-1 space-y-4 overflow-y-auto">

                {availableMethods.length === 0 ? (

                  <div className="text-center text-white/50 p-6">
                    No payment method is currently available for your country.
                  </div>

                ) : (

                  availableMethods.map((method) => (

                    <button
                      key={method.id}
                      onClick={() => handleSelectMethod(method)}
                      className={`w-full p-6 rounded-[2rem] flex items-center justify-between border border-white/5 transition-all active:scale-[0.97] ${
                        method.color || "bg-white/5"
                      }`}
                    >

                      <div className="flex items-center gap-5">

                        <span className="text-4xl">
                          {method.icon}
                        </span>

                        <p className="font-black text-xl leading-none text-white">
                          {method.name}
                        </p>

                      </div>

                      <ChevronRight
                        size={24}
                        className="opacity-40 text-white"
                      />

                    </button>

                  ))

                )}

              </div>

            </div>

          )}

          {/* STEP 2: SECURE PROVIDER CHECKOUT */}

          {paymentStep === 2 && (

            <div className="flex flex-col items-center justify-center flex-1">

              <div
                className={`p-8 rounded-[3rem] w-full border border-white/10 ${
                  selectedMethod?.color || "bg-white/5"
                } bg-opacity-10 backdrop-blur-xl shadow-2xl`}
              >

                <div className="text-center mb-8">

                  <span className="text-6xl mb-4 block">
                    {selectedMethod?.icon || "💳"}
                  </span>

                  <h3 className="text-2xl font-black italic uppercase text-yellow-500 tracking-tighter">
                    {selectedMethod?.name}
                  </h3>

                  <p className="text-white/50 text-sm mt-4">
                    {selectedPackage?.mins} calling minutes
                  </p>

                  <p className="text-green-400 text-2xl font-black mt-2">
                    {getLocalPrice(selectedPackage?.usd)}
                  </p>

                  <p className="text-white/40 text-xs mt-2">
                    You will continue to the secure payment provider.
                  </p>

                </div>

                {paymentMessage && (

                  <div className={`p-4 rounded-xl text-center text-sm mb-5 ${
                    paymentStatus === "error"
                      ? "bg-red-500/10 text-red-300"
                      : "bg-yellow-500/10 text-yellow-300"
                  }`}>

                    {paymentMessage}

                  </div>

                )}

                <button
                  onClick={handleFinalPurchase}
                  disabled={isProcessing || paymentStatus === "checking"}
                  className="w-full bg-yellow-500 text-black font-black p-5 rounded-2xl mt-3 uppercase italic shadow-xl shadow-yellow-500/20 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >

                  {isProcessing ? (

                    <span className="flex items-center justify-center gap-2">
                      <Loader2 size={20} className="animate-spin" />
                      Processing...
                    </span>

                  ) : (

                    "Continue to Secure Payment"

                  )}

                </button>

                {paymentStatus === "pending" ||
                paymentStatus === "error" ? (

                  <button
                    onClick={handleRetryVerification}
                    disabled={isProcessing || !paymentId}
                    className="w-full mt-4 bg-white/5 border border-white/10 text-white p-4 rounded-2xl font-bold disabled:opacity-40"
                  >
                    Check Payment Again
                  </button>

                ) : null}

                <button
                  onClick={handleBackToMethods}
                  disabled={isProcessing}
                  className="w-full mt-4 text-white/50 text-sm font-bold disabled:opacity-30"
                >
                  Back to payment methods
                </button>

              </div>

            </div>

          )}

          {/* STEP 3: CONFIRMED RECEIPT */}

          {paymentStep === 3 && paymentStatus === "paid" && (

            <div className="flex flex-col items-center justify-center flex-1 overflow-y-auto">

              <div
                ref={receiptRef}
                className="bg-black w-full rounded-[3.5rem] p-6 border-2 border-yellow-500/30 shadow-[0_0_80px_rgba(234,179,8,0.15)] relative overflow-hidden flex flex-col items-center"
              >

                <div className="flex flex-col items-center mb-4">

                  <div className="bg-yellow-500/10 p-4 rounded-full mb-2 border border-yellow-500/20">

                    <CheckCircle2
                      size={40}
                      className="text-yellow-500"
                    />

                  </div>

                  <h3 className="text-3xl font-black italic uppercase tracking-tighter text-yellow-500 leading-none">
                    Confirmed
                  </h3>

                  <p className="text-[10px] font-black opacity-30 uppercase tracking-[0.4em] mt-1 italic text-white leading-none">
                    Payment Receipt
                  </p>

                </div>

                <div className="w-full space-y-[14px] py-4 px-6">

                  <div className="flex justify-between items-center">

                    <span className="opacity-60 uppercase font-black text-white text-[12px]">
                      Package
                    </span>

                    <span className="font-black text-yellow-500 italic uppercase text-[16px] leading-none">
                      {selectedPackage?.mins || 0} Minutes
                    </span>

                  </div>

                  <div className="flex justify-between items-center">

                    <span className="opacity-60 uppercase font-black text-white text-[12px]">
                      Customer
                    </span>

                    <span className="font-black text-white text-[12px] uppercase">
                      {userData.email || userData.phone}
                    </span>

                  </div>

                  <div className="flex justify-between items-center">

                    <span className="opacity-60 uppercase font-black text-white text-[12px]">
                      Phone
                    </span>

                    <span className="font-black italic text-white text-[12px]">
                      {userData.phone}
                    </span>

                  </div>

                  <div className="flex justify-between items-center">

                    <span className="opacity-60 uppercase font-black text-white text-[12px]">
                      Method
                    </span>

                    <div className="flex items-center gap-2">

                      <span>
                        {selectedMethod?.icon || "💳"}
                      </span>

                      <span className="font-black text-white text-[12px] uppercase">
                        {selectedMethod?.name || "Online Payment"}
                      </span>

                    </div>

                  </div>

                  <div className="flex justify-between items-center">

                    <span className="opacity-60 uppercase font-black text-white text-[12px]">
                      Reference
                    </span>

                    <span className="font-black text-white text-[10px]">
                      {paymentId ? `${paymentId.slice(0, 12)}...` : "Verified"}
                    </span>

                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-white/10">

                    <span className="font-black uppercase italic text-yellow-500 text-[13px]">
                      Package Price
                    </span>

                    <span className="text-2xl font-black text-green-400 font-mono leading-none">
                      {getLocalPrice(selectedPackage?.usd)}
                    </span>

                  </div>

                </div>

                <p className="mt-2 text-[7px] opacity-20 font-black uppercase tracking-[0.4em] italic text-white text-center">
                  Habesha Tele Official Systems
                </p>

              </div>

              {/* RECEIPT ACTIONS */}

              <div className="mt-5 grid grid-cols-2 gap-4 w-full">

                <button
                  onClick={handleSaveReceipt}
                  className="bg-white/5 p-4 rounded-2xl flex items-center justify-center gap-2 border border-white/5 hover:bg-white/10 font-black text-[10px] uppercase italic text-white"
                >
                  <Download size={16} />
                  Save
                </button>

                <button
                  onClick={handleShareReceipt}
                  className="bg-white/5 p-4 rounded-2xl flex items-center justify-center gap-2 border border-white/5 hover:bg-white/10 font-black text-[10px] uppercase italic text-white"
                >
                  <Share2 size={16} />
                  Share
                </button>

              </div>

              <button
                onClick={handleClose}
                className="w-full mt-4 bg-yellow-500 text-black p-4 rounded-3xl font-black uppercase italic text-xs tracking-widest active:scale-95 transition-all shadow-lg"
              >
                Back to Home
              </button>

            </div>

          )}

          {/* SECURITY FOOTER */}

          {paymentStep !== 3 && (

            <div className="mt-auto flex items-center justify-center gap-2 opacity-20">

              <ShieldCheck size={14} />

              <p className="text-[9px] uppercase font-black tracking-widest italic text-white">
                Encrypted Secure Node
              </p>

            </div>

          )}

        </div>

      )}

    </div>
  );
};

export default BuyCard;

