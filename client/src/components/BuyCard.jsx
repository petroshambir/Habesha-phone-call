
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

import React, { useState, useEffect, useRef } from "react";
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
  Share2
} from "lucide-react";

const API_URL = "https://habesha-phone-call-4.onrender.com/api";

const BuyCard = () => {
  const navigate = useNavigate();
  const receiptRef = useRef(null);

  const [userData, setUserData] = useState({
    phone: "",
    currency: "USD"
  });

  const [packages, setPackages] = useState([]);
  const [availableMethods, setAvailableMethods] = useState([]);

  const [loading, setLoading] = useState(true);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState(null);

  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  const [paymentStep, setPaymentStep] = useState(1);

  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState("");
  const [paymentId, setPaymentId] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");

  const token = localStorage.getItem("token");

  // --------------------------------------------------
  // INITIAL DATA + PAYMENT RETURN VERIFICATION
  // --------------------------------------------------

  useEffect(() => {
    const initialize = async () => {
      try {
        const userPhone = localStorage.getItem("userPhone");
        const authToken = localStorage.getItem("token");

        if (!authToken) {
          navigate("/login");
          return;
        }

        setUserData({
          phone: userPhone || "",
          currency: "USD"
        });

        // Get packages and available payment providers
        const response = await axios.get(
          `${API_URL}/payments/packages`
        );

        if (response.data.success) {
          setPackages(response.data.packages || []);

          const providers = (response.data.providers || [])
            .filter((provider) => provider.available)
            .map((provider) => ({
              id: provider.id,
              name: {
                chapa: "Chapa",
                flutterwave: "Flutterwave",
                stripe: "Credit / Debit Card",
                paypal: "PayPal"
              }[provider.id] || provider.id,
              icon: {
                chapa: "🇪🇹",
                flutterwave: "🌍",
                stripe: "💳",
                paypal: "🅿️"
              }[provider.id] || "💰",
              color: "bg-white/5"
            }));

          setAvailableMethods(providers);
        }

        // Check whether the user has returned from a payment provider
        const params = new URLSearchParams(window.location.search);
        const returnedPaymentId = params.get("paymentId");

        if (returnedPaymentId) {
          setShowPaymentOptions(true);
          setPaymentStep(2);
          setPaymentId(returnedPaymentId);
          setPaymentMessage("Verifying your payment...");

          const transactionId = params.get("transaction_id");

          const verifyUrl =
            `${API_URL}/payments/verify/${encodeURIComponent(returnedPaymentId)}`;

          const verifyResponse = await axios.get(verifyUrl, {
            headers: {
              Authorization: `Bearer ${authToken}`
            },
            params: transactionId
              ? { transaction_id: transactionId }
              : {},
            validateStatus: (status) =>
              status >= 200 && status < 500
          });

          if (verifyResponse.data?.paid === true) {
            const paidMinutes = verifyResponse.data.minutes;

            setSelectedPackage({
              mins: paidMinutes,
              usd: null,
              id: null
            });

            setPaymentStatus("paid");
            setPaymentMessage(
              "Your payment was verified and your minutes have been credited."
            );
            setPaymentStep(3);
          } else {
            setPaymentStatus("pending");
            setPaymentMessage(
              verifyResponse.data?.msg ||
              "Payment has not been confirmed yet. Please try again shortly."
            );
            setPaymentStep(2);
          }

          // Remove payment parameters from the browser address
          window.history.replaceState(
            {},
            document.title,
            window.location.pathname
          );
        }
      } catch (error) {
        console.error("BuyCard initialization error:", error);

        setPaymentMessage(
          error.response?.data?.msg ||
          "Unable to load payment information. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, [navigate]);

  // --------------------------------------------------
  // PACKAGE SELECTION
  // --------------------------------------------------

  const handleSelectPackage = (pkg) => {
    setSelectedPackage(pkg);
    setSelectedMethod(null);
    setPaymentStep(1);
    setPaymentMessage("");
    setPaymentStatus("");
    setPaymentId("");
    setShowPaymentOptions(true);
  };

  const handleSelectMethod = (method) => {
    setSelectedMethod(method);
    setPaymentStep(2);
    setPaymentMessage("");
  };

  // --------------------------------------------------
  // CREATE CHECKOUT
  // --------------------------------------------------

  const handleFinalPurchase = async () => {
    if (!selectedPackage || !selectedMethod) {
      alert("Please select a package and payment method.");
      return;
    }

    if (!token) {
      navigate("/login");
      return;
    }

    setIsProcessing(true);
    setPaymentMessage("");

    try {
      const idempotencyKey =
        window.crypto?.randomUUID?.() ||
        `HT-${Date.now()}-${Math.random().toString(36).slice(2)}`;

      const response = await axios.post(
        `${API_URL}/payments/checkout`,
        {
          packageId: selectedPackage.id,
          provider: selectedMethod.id
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Idempotency-Key": idempotencyKey,
            "Content-Type": "application/json"
          }
        }
      );

      if (
        response.data.success &&
        response.data.checkoutUrl
      ) {
        setPaymentId(response.data.paymentId);
        setPaymentStatus(response.data.status);

        // Open the provider's secure hosted checkout page
        window.location.assign(response.data.checkoutUrl);
      } else {
        setPaymentMessage(
          response.data.msg || "Unable to start checkout."
        );
      }
    } catch (error) {
      console.error("Checkout error:", error);

      setPaymentMessage(
        error.response?.data?.msg ||
        "Checkout could not be started. Please try again."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // --------------------------------------------------
  // RETRY PAYMENT VERIFICATION
  // --------------------------------------------------

  const handleVerifyAgain = async () => {
    if (!paymentId || !token) return;

    setIsProcessing(true);
    setPaymentMessage("Checking payment status...");

    try {
      const params = new URLSearchParams(window.location.search);
      const transactionId = params.get("transaction_id");

      const response = await axios.get(
        `${API_URL}/payments/verify/${encodeURIComponent(paymentId)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          },
          params: transactionId
            ? { transaction_id: transactionId }
            : {},
          validateStatus: (status) =>
            status >= 200 && status < 500
        }
      );

      if (response.data?.paid === true) {
        setSelectedPackage({
          mins: response.data.minutes,
          usd: null,
          id: null
        });

        setPaymentStatus("paid");
        setPaymentMessage(
          "Your payment was verified and your minutes have been credited."
        );
        setPaymentStep(3);
      } else {
        setPaymentStatus("pending");
        setPaymentMessage(
          response.data?.msg ||
          "Payment is still pending. Please check again later."
        );
      }
    } catch (error) {
      console.error("Payment verification error:", error);

      setPaymentMessage(
        error.response?.data?.msg ||
        "Unable to verify payment. Please try again later."
      );
    } finally {
      setIsProcessing(false);
    }
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
      link.download = `HabeshaTele_Receipt_${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Save receipt error:", error);
      alert("Unable to save receipt.");
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
          title: "HabeshaTele Receipt",
          text: `I purchased ${selectedPackage?.mins} minutes on HabeshaTele!`
        });
      } else {
        alert("Sharing is not supported on this browser. Please save the receipt instead.");
      }
    } catch (error) {
      console.error("Share receipt error:", error);
    }
  };

  // --------------------------------------------------
  // CLOSE CHECKOUT
  // --------------------------------------------------

  const handleClose = () => {
    setShowPaymentOptions(false);

    if (paymentStep === 3 && paymentStatus === "paid") {
      navigate("/home", {
        state: {
          refresh: Date.now(),
          userPhone: userData.phone
        }
      });
    }

    setPaymentStep(1);
    setSelectedMethod(null);
    setPaymentMessage("");
  };

  // --------------------------------------------------
  // LOADING
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
          Currency: USD
        </div>
      </div>

      {/* PACKAGES */}

      <div className="space-y-4 overflow-y-auto scrollbar-hide pb-6">

        {packages.map((card) => (
          <div
            key={card.id}
            onClick={() => handleSelectPackage({
              id: card.id,
              mins: card.minutes,
              usd: card.price
            })}
            className="bg-gradient-to-br from-blue-900/40 to-black p-6 rounded-[2.5rem] border border-white/10 relative group cursor-pointer active:scale-95 transition-all shadow-2xl"
          >
            <div className="flex justify-between items-end relative z-10">

              <div className="space-y-1">
                <h2 className="text-4xl font-black italic tracking-tighter leading-none">
                  {card.minutes} MINS
                </h2>

                <div className="pt-2">
                  <p className="text-[9px] opacity-40 uppercase font-black tracking-widest leading-none mb-1">
                    Global Price
                  </p>

                  <p className="text-yellow-500 font-black text-lg leading-none">
                    ${Number(card.price).toFixed(2)} USD
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className="text-[10px] opacity-40 uppercase font-black tracking-widest mb-1">
                  Secure Payment
                </p>

                <p className="text-2xl font-black text-green-400 italic font-mono leading-none">
                  ${Number(card.price).toFixed(2)}
                </p>
              </div>
            </div>

            <CreditCard
              className="absolute top-4 right-4 opacity-5 rotate-12"
              size={80}
            />
          </div>
        ))}

        {packages.length === 0 && (
          <p className="text-center text-white/40 py-10">
            No payment packages are currently available.
          </p>
        )}
      </div>

      {/* CHECKOUT */}

      {showPaymentOptions && (
        <div className="fixed inset-0 bg-[#020617] z-50 flex flex-col p-6 animate-in slide-in-from-bottom duration-300">

          {/* CHECKOUT HEADER */}

          <div className="flex justify-between items-center mb-8">
            <button
              onClick={handleClose}
              className="p-3 bg-white/5 rounded-2xl"
            >
              <X size={24} />
            </button>

            <h2 className="text-2xl font-black italic uppercase tracking-tighter">
              {paymentStep === 1 && "Checkout"}
              {paymentStep === 2 && "Payment Status"}
              {paymentStep === 3 && "Receipt"}
            </h2>

            <div className="w-12"></div>
          </div>

          {/* STEP 1: SELECT PROVIDER */}

          {paymentStep === 1 && (
            <div className="flex flex-col h-full">

              <p className="text-sm text-center text-white/40 mb-8 uppercase font-bold tracking-widest italic">
                Select Method to pay{" "}
                <span className="text-green-400">
                  ${Number(selectedPackage?.usd || 0).toFixed(2)} USD
                </span>
              </p>

              <div className="flex-1 space-y-4 overflow-y-auto">

                {availableMethods.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => handleSelectMethod(method)}
                    className={`w-full p-6 rounded-[2rem] flex items-center justify-between border border-white/5 transition-all active:scale-[0.97] ${method.color}`}
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
                ))}

                {availableMethods.length === 0 && (
                  <p className="text-center text-white/40 py-8">
                    No payment methods are currently available.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* STEP 2: CONFIRM HOSTED CHECKOUT */}

          {paymentStep === 2 && (
            <div className="flex flex-col items-center justify-center flex-1">

              <div className="p-8 rounded-[3rem] w-full border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl">

                <div className="text-center mb-8">
                  <span className="text-6xl mb-4 block">
                    {selectedMethod?.icon || "🔒"}
                  </span>

                  <h3 className="text-2xl font-black italic uppercase text-yellow-500 tracking-tighter">
                    {selectedMethod?.name || "Payment Verification"}
                  </h3>

                  <p className="text-white/50 text-sm mt-3">
                    {paymentId
                      ? "We are checking your payment with the provider."
                      : "You will be redirected to the provider's secure payment page."}
                  </p>
                </div>

                {selectedPackage && (
                  <div className="text-center mb-6">
                    <p className="text-white/40 text-xs uppercase font-bold">
                      Selected Package
                    </p>

                    <p className="text-3xl font-black text-white">
                      {selectedPackage.mins} Minutes
                    </p>

                    {selectedPackage.usd !== null && (
                      <p className="text-yellow-500 font-black text-xl mt-2">
                        ${Number(selectedPackage.usd).toFixed(2)} USD
                      </p>
                    )}
                  </div>
                )}

                {paymentMessage && (
                  <p className="text-center text-sm text-yellow-400 mb-5">
                    {paymentMessage}
                  </p>
                )}

                {paymentId ? (
                  <button
                    onClick={handleVerifyAgain}
                    disabled={isProcessing}
                    className="w-full bg-yellow-500 text-black font-black p-5 rounded-2xl uppercase italic shadow-xl shadow-yellow-500/20 active:scale-95 transition-all disabled:opacity-50"
                  >
                    {isProcessing ? "Checking..." : "Check Payment Again"}
                  </button>
                ) : (
                  <button
                    onClick={handleFinalPurchase}
                    disabled={isProcessing || !selectedMethod}
                    className="w-full bg-yellow-500 text-black font-black p-5 rounded-2xl uppercase italic shadow-xl shadow-yellow-500/20 active:scale-95 transition-all disabled:opacity-50"
                  >
                    {isProcessing ? "Processing..." : "Continue to Secure Payment"}
                  </button>
                )}

                <button
                  onClick={() => {
                    setPaymentStep(1);
                    setPaymentId("");
                    setPaymentMessage("");
                  }}
                  className="w-full mt-4 text-white/40 text-xs font-bold uppercase"
                >
                  Change Payment Method
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: VERIFIED RECEIPT */}

          {paymentStep === 3 && paymentStatus === "paid" && (
            <div className="flex flex-col items-center justify-center flex-1">

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
                      {selectedPackage?.mins} Minutes
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="opacity-60 uppercase font-black text-white text-[12px]">
                      Customer
                    </span>

                    <span className="font-black text-white text-[14px] uppercase">
                      {userData.phone || "HabeshaTele User"}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="opacity-60 uppercase font-black text-white text-[12px]">
                      Payment ID
                    </span>

                    <span className="font-black italic text-white text-[11px]">
                      {paymentId}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="opacity-60 uppercase font-black text-white text-[12px]">
                      Status
                    </span>

                    <span className="font-black text-green-400 text-[14px] uppercase">
                      PAID
                    </span>
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-white/10">
                    <span className="font-black uppercase italic text-yellow-500 text-[13px]">
                      Total Paid
                    </span>

                    <span className="text-xl font-black text-green-400 font-mono leading-none">
                      Verified
                    </span>
                  </div>
                </div>

                <p className="mt-2 text-[7px] opacity-20 font-black uppercase tracking-[0.4em] italic text-white text-center">
                  Habesha Tele Official Systems
                </p>
              </div>

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

          {/* FOOTER SECURITY */}

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