


// // import React, { useState, useEffect } from "react";
// // import axios from "axios";
// // import { PlusCircle, Globe, Settings } from "lucide-react";

// // const AdminDashboard = () => {
// //   const [stats, setStats] = useState([]);
// //   const [manualData, setManualData] = useState({ phone: "+", minutes: "" });
// //   const [loading, setLoading] = useState(false);

// //   // --- 1. እቲ State (ብዲፎልት Automatic ይኹን፡ ግን ካብ Database ይጽበ) ---
// //   const [rateSettings, setRateSettings] = useState({ manualRate: "", useManual: false });

// //   useEffect(() => { 
// //     fetchStats(); 
// //     fetchCurrentRate(); 
// //   }, []);

// //   const fetchStats = async () => {
// //     try {
// //       const res = await axios.get("https://habesha-phone-call-4.onrender.com/api/admin/stats");
// //       if (res.data.success) {
// //         const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });
// //         const formattedData = res.data.stats.map(item => {
// //           let countryName = "Unknown";
// //           try {
// //             if (item._id && item._id !== "Unknown") {
// //               countryName = regionNames.of(item._id);
// //             }
// //           } catch (e) { countryName = item._id || "Other"; }
// //           return { name: countryName, value: item.count || 0 };
// //         });
// //         setStats(formattedData);
// //       }
// //     } catch (err) { console.error("Error fetching stats", err); }
// //   };

// // //   const fetchCurrentRate = async () => {
// // //     try {
// // //       // ንኹሉ Currency ሓደ ዓይነት Settings ስለዘለካ "ETB" ንጥቀም
// // //       const res = await axios.get("http://localhost:5000/api/auth/get-current-rate/ETB"); 
// // //       if (res.data.success && res.data.settings) {
// // //         setRateSettings({
// // //           manualRate: res.data.settings.manualRate,
// // //           useManual: false // ኩሉ ግዜ ምስ ከፈትካዮ ብ Auto ንኪጅምር
// // //         });
// // //       }
// // //     } catch (err) { console.log("No previous settings found"); }
// // //   }; 

// // const fetchCurrentRate = async () => {
// //     try {
// //       const res = await axios.get("https://habesha-phone-call-4.onrender.com/api/auth/get-current-rate/ETB"); 
// //       if (res.data.success && res.data.settings) {
// //         setRateSettings({
// //           manualRate: res.data.settings.manualRate,
// //           // *** እዛ መስመር እያ እታ መፍትሒ: ካብ DB እቲ ዝነበረ Mode (True/False) የውጽኦ ***
// //           useManual: res.data.settings.useManualRate 
// //         });
// //       }
// //     } catch (err) { 
// //         console.log("No previous settings found"); 
// //     }
// //   };

// //   const updateExchangeRate = async () => {
// //     try {
// //       const response = await axios.post("https://habesha-phone-call-4.onrender.com/api/auth/admin/update-rate", {
// //         currency: "ETB",
// //         useManualRate: rateSettings.useManual, 
// //         manualRate: rateSettings.manualRate
// //       });
// //       if (response.data.success) {
// //         alert(`ተዓዊቱ! ሕጂ ኣብ ${rateSettings.useManual ? "MANUAL" : "AUTOMATIC"} Mode ኣሎ።`);
// //       }
// //     } catch (err) { alert("Error saving settings!"); }
// //   };



// //   const handleManualUpdate = async () => {
// //     if (manualData.phone === "+" || !manualData.minutes) return alert("በጃኻ ኩሉ መልእ!");
// //     setLoading(true);
// //     try {
// //       const res = await axios.put("https://habesha-phone-call-4.onrender.com/api/admin/manual-update", {
// //         phone: manualData.phone,
// //         minutesToAdd: manualData.minutes
// //       });
// //       if (res.data.success) {
// //         alert(`ተዓዊቱ! ሓድሽ ባላንስ: ${res.data.newBalance}`);
// //         setManualData({ phone: "+", minutes: "" });
// //         fetchStats();
// //       }
// //     } catch (err) { alert("ጌጋ ኣሎ!"); }
// //     setLoading(false);
// //   };

// //   const totalUsers = stats.reduce((acc, curr) => acc + curr.value, 0);

// //   return (
// //     <div className="min-h-screen bg-[#020617] text-white p-8 font-sans">
// //       <h1 className="text-3xl font-black text-yellow-500 mb-8 italic uppercase tracking-tighter italic">Admin Control Panel</h1>
// //       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
// //         {/* User Distribution */}
// //         <div className="bg-white/5 p-6 rounded-3xl border border-white/10 flex flex-col">
// //           <div className="flex items-center gap-3 mb-8">
// //             <Globe className="text-blue-400" />
// //             <h2 className="text-xl font-bold uppercase tracking-widest">User Distribution</h2>
// //           </div>
// //           <div className="space-y-6">
// //             {stats.map((item, i) => {
// //               const percentage = totalUsers > 0 ? Math.round((item.value / totalUsers) * 100) : 0;
// //               return (
// //                 <div key={i} className="space-y-2">
// //                   <div className="flex justify-between items-end">
// //                     <span className="font-black text-yellow-500 uppercase tracking-tighter text-xs">{item.name}</span>
// //                     <span className="text-[10px] font-bold opacity-60">{percentage}% ({item.value} Users)</span>
// //                   </div>
// //                   <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
// //                     <div className="h-full bg-yellow-500 rounded-full transition-all duration-1000" style={{ width: `${percentage}%` }}></div>
// //                   </div>
// //                 </div>
// //               );
// //             })}
// //           </div>
// //         </div>

// //         {/* Manual Load */}
// //         <div className="bg-white/5 p-6 rounded-3xl border border-white/10 h-fit">
// //           <div className="flex items-center gap-3 mb-6 text-green-400">
// //             <PlusCircle />
// //             <h2 className="text-xl font-bold uppercase">Manual Minutes Load</h2>
// //           </div>
// //           <div className="space-y-4">
// //             <input type="text" placeholder="Phone (+256...)" className="w-full bg-black/50 border border-white/10 p-4 rounded-2xl outline-none focus:border-yellow-500" value={manualData.phone} onChange={(e) => e.target.value.startsWith("+") && setManualData({...manualData, phone: e.target.value})} />
// //             <input type="number" placeholder="Minutes" className="w-full bg-black/50 border border-white/10 p-4 rounded-2xl outline-none focus:border-yellow-500" value={manualData.minutes} onChange={(e) => setManualData({...manualData, minutes: e.target.value})} />
// //             <button onClick={handleManualUpdate} disabled={loading} className="w-full bg-yellow-500 text-black font-black p-4 rounded-2xl active:scale-95 transition-all uppercase tracking-widest shadow-lg">{loading ? "Updating..." : "Add Minutes Now"}</button>
// //           </div>
// //         </div>

// //         {/* EXCHANGE RATE CONTROL */}
// //         <div className="bg-white/5 p-6 rounded-3xl border border-white/10 md:col-span-2">
// //           <div className="flex items-center gap-3 mb-6 text-yellow-500">
// //             <Settings />
// //             <h2 className="text-xl font-bold uppercase">Exchange Rate Control</h2>
// //           </div>
// //           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
// //             <div className="bg-black/40 p-4 rounded-2xl border border-white/5">
// //               <p className="text-[10px] opacity-40 uppercase font-black mb-3 italic">Rate Mode</p>
// //               <div className="flex items-center justify-between">
// //                 <span className="text-sm font-bold">{rateSettings.useManual ? "MANUAL" : "AUTOMATIC"}</span>
// //                 <button onClick={() => setRateSettings({...rateSettings, useManual: !rateSettings.useManual})} className={`w-12 h-6 rounded-full transition-all relative ${rateSettings.useManual ? 'bg-yellow-500' : 'bg-gray-600'}`}>
// //                   <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${rateSettings.useManual ? 'right-1' : 'left-1'}`} />
// //                 </button>
// //               </div>
// //             </div>
// //             <div className="bg-black/40 p-4 rounded-2xl border border-white/5">
// //               <p className="text-[10px] opacity-40 uppercase font-black mb-1 italic">Set Value (1 USD = ?)</p>
// //               <input type="number" disabled={!rateSettings.useManual} placeholder="e.g. 155" className="w-full bg-transparent text-2xl font-black text-yellow-500 outline-none disabled:opacity-20" value={rateSettings.manualRate} onChange={(e) => setRateSettings({...rateSettings, manualRate: e.target.value})} />
// //             </div>
// //             <button onClick={updateExchangeRate} className="bg-blue-600 hover:bg-blue-500 text-white font-black p-5 rounded-2xl uppercase italic tracking-widest transition-all active:scale-95 shadow-lg">Save Rate Settings</button>
// //           </div>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // };

// // export default AdminDashboard;


// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import { PlusCircle, Globe, Settings } from "lucide-react";

// const AdminDashboard = () => {
//   const [stats, setStats] = useState([]);
//   const [manualData, setManualData] = useState({ phone: "+", minutes: "" });
//   const [loading, setLoading] = useState(false);

//   // 🔄 ሓዳስ ክፍሊ 1፦ ነታ ዝተመርጸት ሃገር ንምሓዝ (ብዲፎልት ETB) ሓድሽ State ተወሲኹ
//   const [selectedCurrency, setSelectedCurrency] = useState("ETB");
//   const [rateSettings, setRateSettings] = useState({ manualRate: "", useManual: false });

//   // 🔄 ሓዳስ ክፍሊ 2፦ እቲ useEffect ሕጂ በታ ዝተመርጸት ሃገር ክጽበ ዳይናሚክ ጌርናዮ ኣለና
//   useEffect(() => { 
//     fetchStats(); 
//     fetchCurrentRate(selectedCurrency); 
//   }, [selectedCurrency]);

//   const fetchStats = async () => {
//     try {
//       const res = await axios.get("https://habesha-phone-call-4.onrender.com/api/admin/stats");
//       if (res.data.success) {
//         const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });
//         const formattedData = res.data.stats.map(item => {
//           let countryName = "Unknown";
//           try {
//             if (item._id && item._id !== "Unknown") {
//               countryName = regionNames.of(item._id);
//             }
//           } catch (e) { countryName = item._id || "Other"; }
//           return { name: countryName, value: item.count || 0 };
//         });
//         setStats(formattedData);
//       }
//     } catch (err) { console.error("Error fetching stats", err); }
//   };

//   // 🔄 ሓዳስ ክፍሊ 3፦ እዛ fetchCurrentRate ሕጂ ዝተመርጸት ሃገር (Currency) ተቐቢላ ካብ DB ዳታ ተምጽእ
//   const fetchCurrentRate = async (currencyCode) => {
//     try {
//       const res = await axios.get(`https://habesha-phone-call-4.onrender.com/api/auth/get-current-rate/${currencyCode}`); 
//       if (res.data.success && res.data.settings) {
//         setRateSettings({
//           manualRate: res.data.settings.manualRate,
//           useManual: res.data.settings.useManualRate 
//         });
//       } else {
//         // ገና ኣብ Database Settings እንተዘይተፈጢሩሉ (ብዲፎልት Auto ይኹን)
//         setRateSettings({ manualRate: "", useManual: false });
//       }
//     } catch (err) { 
//         console.log("No previous settings found for " + currencyCode); 
//         setRateSettings({ manualRate: "", useManual: false });
//     }
//   };

//   // 🔄 ሓዳስ ክፍሊ 4፦ እዚ ሰቭ ክገብር ከሎ ቀጥታ ነታ ዝተመርጸት ሃገር (selectedCurrency) ጥራሕ ይቕይር
//   const updateExchangeRate = async () => {
//     try {
//       const response = await axios.post("https://habesha-phone-call-4.onrender.com/api/auth/admin/update-rate", {
//         currency: selectedCurrency, // 👈 ሕጂ "ETB" ጥራሕ ዘይኮነስ እታ ዝተመርጸት ሃገር ትኸይድ
//         useManualRate: rateSettings.useManual, 
//         manualRate: rateSettings.manualRate
//       });
//       if (response.data.success) {
//         alert(`ተዓዊቱ! ሕጂ [${selectedCurrency}] ኣብ ${rateSettings.useManual ? "MANUAL" : "AUTOMATIC"} Mode ኣሎ።`);
//       }
//     } catch (err) { alert("Error saving settings!"); }
//   };

//   const handleManualUpdate = async () => {
//     if (manualData.phone === "+" || !manualData.minutes) return alert("በጃኻ ኩሉ መልእ!");
//     setLoading(true);
//     try {
//       const res = await axios.put("https://habesha-phone-call-4.onrender.com/api/admin/manual-update", {
//         phone: manualData.phone,
//         minutesToAdd: manualData.minutes
//       });
//       if (res.data.success) {
//         alert(`ተዓዊቱ! ሓድሽ ባላንስ: ${res.data.newBalance}`);
//         setManualData({ phone: "+", minutes: "" });
//         fetchStats();
//       }
//     } catch (err) { alert("ጌጋ ኣሎ!"); }
//     setLoading(false);
//   };

//   const totalUsers = stats.reduce((acc, curr) => acc + curr.value, 0);

//   return (
//     <div className="min-h-screen bg-[#020617] text-white p-8 font-sans">
//       <h1 className="text-3xl font-black text-yellow-500 mb-8 italic uppercase tracking-tighter">Admin Control Panel</h1>
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
//         {/* User Distribution */}
//         <div className="bg-white/5 p-6 rounded-3xl border border-white/10 flex flex-col">
//           <div className="flex items-center gap-3 mb-8">
//             <Globe className="text-blue-400" />
//             <h2 className="text-xl font-bold uppercase tracking-widest">User Distribution</h2>
//           </div>
//           <div className="space-y-6">
//             {stats.map((item, i) => {
//               const percentage = totalUsers > 0 ? Math.round((item.value / totalUsers) * 100) : 0;
//               return (
//                 <div key={i} className="space-y-2">
//                   <div className="flex justify-between items-end">
//                     <span className="font-black text-yellow-500 uppercase tracking-tighter text-xs">{item.name}</span>
//                     <span className="text-[10px] font-bold opacity-60">{percentage}% ({item.value} Users)</span>
//                   </div>
//                   <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
//                     <div className="h-full bg-yellow-500 rounded-full transition-all duration-1000" style={{ width: `${percentage}%` }}></div>
//                   </div>
//                 </div>
//               );
//             })}
//           </div>
//         </div>

//         {/* Manual Load */}
//         <div className="bg-white/5 p-6 rounded-3xl border border-white/10 h-fit">
//           <div className="flex items-center gap-3 mb-6 text-green-400">
//             <PlusCircle />
//             <h2 className="text-xl font-bold uppercase">Manual Minutes Load</h2>
//           </div>
//           <div className="space-y-4">
//             <input type="text" placeholder="Phone (+256...)" className="w-full bg-black/50 border border-white/10 p-4 rounded-2xl outline-none focus:border-yellow-500" value={manualData.phone} onChange={(e) => e.target.value.startsWith("+") && setManualData({...manualData, phone: e.target.value})} />
//             <input type="number" placeholder="Minutes" className="w-full bg-black/50 border border-white/10 p-4 rounded-2xl outline-none focus:border-yellow-500" value={manualData.minutes} onChange={(e) => setManualData({...manualData, minutes: e.target.value})} />
//             <button onClick={handleManualUpdate} disabled={loading} className="w-full bg-yellow-500 text-black font-black p-4 rounded-2xl active:scale-95 transition-all uppercase tracking-widest shadow-lg">{loading ? "Updating..." : "Add Minutes Now"}</button>
//           </div>
//         </div>

//         {/* EXCHANGE RATE CONTROL */}
//         <div className="bg-white/5 p-6 rounded-3xl border border-white/10 md:col-span-2">
//           <div className="flex items-center gap-3 mb-6 text-yellow-500">
//             <Settings />
//             <h2 className="text-xl font-bold uppercase">Exchange Rate Control</h2>
//           </div>
          
//           {/* 🔄 ሓዳስ ክፍሊ 5፦ ሕጂ እቲ ሳጹን 4 ዓምዲ (md:grid-cols-4) ኮይኑ ሓድሽ Dropdown መምረጺ ሃገራት ተገጢሙሉ ኣሎ */}
//           <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
            
//             {/* 📍 እቲ ዝተወሰኸ ሓዱሽ Dropdown መምረጺ */}
//             <div className="bg-black/40 p-4 rounded-2xl border border-white/5">
//               <p className="text-[10px] opacity-40 uppercase font-black mb-2 italic">Select Currency</p>
//               <select 
//                 value={selectedCurrency} 
//                 onChange={(e) => setSelectedCurrency(e.target.value)}
//                 className="w-full bg-transparent text-lg font-black text-yellow-500 outline-none cursor-pointer"
//               >
//                 <option value="ETB" className="bg-[#020617] text-white">ETB - Ethiopia</option>
//                 <option value="UGX" className="bg-[#020617] text-white">UGX - Uganda</option>
//                 <option value="KES" className="bg-[#020617] text-white">KES - Kenya</option>
//                 <option value="AOA" className="bg-[#020617] text-white">AOA - Angola</option>
//                 <option value="SSP" className="bg-[#020617] text-white">SSP - South Sudan</option>
//                 <option value="SDG" className="bg-[#020617] text-white">SDG - Sudan</option>
//               </select>
//             </div>

//             <div className="bg-black/40 p-4 rounded-2xl border border-white/5">
//               <p className="text-[10px] opacity-40 uppercase font-black mb-3 italic">Rate Mode</p>
//               <div className="flex items-center justify-between">
//                 <span className="text-sm font-bold">{rateSettings.useManual ? "MANUAL" : "AUTOMATIC"}</span>
//                 <button onClick={() => setRateSettings({...rateSettings, useManual: !rateSettings.useManual})} className={`w-12 h-6 rounded-full transition-all relative ${rateSettings.useManual ? 'bg-yellow-500' : 'bg-gray-600'}`}>
//                   <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${rateSettings.useManual ? 'right-1' : 'left-1'}`} />
//                 </button>
//               </div>
//             </div>

//             <div className="bg-black/40 p-4 rounded-2xl border border-white/5">
//               <p className="text-[10px] opacity-40 uppercase font-black mb-1 italic">Set Value (1 USD = ?)</p>
//               <input type="number" disabled={!rateSettings.useManual} placeholder="e.g. 155" className="w-full bg-transparent text-2xl font-black text-yellow-500 outline-none disabled:opacity-20" value={rateSettings.manualRate} onChange={(e) => setRateSettings({...rateSettings, manualRate: e.target.value})} />
//             </div>

//             <button onClick={updateExchangeRate} className="bg-blue-600 hover:bg-blue-500 text-white font-black p-5 rounded-2xl uppercase italic tracking-widest transition-all active:scale-95 shadow-lg w-full">Save Rate Settings</button>
//           </div>

//         </div>
//       </div>
//     </div>
//   );
// };

// export default AdminDashboard;


import React, { useState, useEffect } from "react";
import axios from "axios";
import { PlusCircle, Globe, Settings } from "lucide-react";

const AdminDashboard = () => {
  const [stats, setStats] = useState([]);
  const [manualData, setManualData] = useState({ phone: "+", minutes: "" });
  const [loading, setLoading] = useState(false);

  // 🔄 ሓዳስ ክፍሊ 1፦ ነታ ዝተመርጸት ሃገር ንምሓዝ (ብዲፎልት ETB) ሓድሽ State ተወሲኹ
  const [selectedCurrency, setSelectedCurrency] = useState("ETB");
  const [rateSettings, setRateSettings] = useState({ manualRate: "", useManual: false });

  // 🔄 ሓዳስ ክፍሊ 2፦ እቲ useEffect ሕጂ በታ ዝተመርጸት ሃገር ክጽበ ዳይናሚክ ጌርናዮ ኣለና
  useEffect(() => { 
    fetchStats(); 
    fetchCurrentRate(selectedCurrency); 
  }, [selectedCurrency]);

  const fetchStats = async () => {
    try {
      const res = await axios.get("https://habesha-phone-call-4.onrender.com/api/admin/stats");
      if (res.data.success) {
        const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });
        const formattedData = res.data.stats.map(item => {
          let countryName = "Unknown";
          try {
            if (item._id && item._id !== "Unknown") {
              countryName = regionNames.of(item._id);
            }
          } catch (e) { countryName = item._id || "Other"; }
          return { name: countryName, value: item.count || 0 };
        });
        setStats(formattedData);
      }
    } catch (err) { console.error("Error fetching stats", err); }
  };

  // 🔄 ሓዳስ ክፍሊ 3፦ እዛ fetchCurrentRate ሕጂ ዝተመርጸት ሃገር (Currency) ተቐቢላ ካብ DB ዳታ ተምጽእ
  const fetchCurrentRate = async (currencyCode) => {
    try {
      const res = await axios.get(`https://habesha-phone-call-4.onrender.com/api/auth/get-current-rate/${currencyCode}`); 
      if (res.data.success && res.data.settings) {
        setRateSettings({
          manualRate: res.data.settings.manualRate,
          useManual: res.data.settings.useManualRate 
        });
      } else {
        setRateSettings({ manualRate: "", useManual: false });
      }
    } catch (err) { 
        console.log("No previous settings found for " + currencyCode); 
        setRateSettings({ manualRate: "", useManual: false });
    }
  };

  // 🔄 ሓዳስ ክፍሊ 4፦ እዚ ሰቭ ክገብር ከሎ ቀጥታ ነታ ዝተመርጸት ሃገር (selectedCurrency) ጥራሕ ይቕይር
  const updateExchangeRate = async () => {
    // 🛡️ Validation: Manual Mode እንተኮይኑ እቲ Value ባዶ ወይ 0 ክኸውን የብሉን
    if (rateSettings.useManual && (!rateSettings.manualRate || Number(rateSettings.manualRate) <= 0)) {
      return alert("በጃኻ ንማኑዋል ሞድ ዝኸውን ቅኑዕ ዋጋ የእቱ!");
    }

    try {
      const response = await axios.post("https://habesha-phone-call-4.onrender.com/api/auth/admin/update-rate", {
        currency: selectedCurrency, 
        useManualRate: rateSettings.useManual, 
        manualRate: rateSettings.manualRate || 0
      });
      if (response.data.success) {
        alert(`ተዓዊቱ! ሕጂ [${selectedCurrency}] ኣብ ${rateSettings.useManual ? "MANUAL" : "AUTOMATIC"} Mode ኣሎ።`);
      }
    } catch (err) { alert("Error saving settings!"); }
  };

  const handleManualUpdate = async () => {
    if (manualData.phone === "+" || !manualData.minutes) return alert("በጃኻ ኩሉ መልእ!");
    setLoading(true);
    try {
      const res = await axios.put("https://habesha-phone-call-4.onrender.com/api/admin/manual-update", {
        phone: manualData.phone,
        minutesToAdd: manualData.minutes
      });
      if (res.data.success) {
        alert(`ተዓዊቱ! ሓድሽ ባላንስ: ${res.data.newBalance}`);
        setManualData({ phone: "+", minutes: "" });
        fetchStats();
      }
    } catch (err) { alert("ጌጋ ኣሎ!"); }
    setLoading(false);
  };

  const totalUsers = stats.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="min-h-screen bg-[#020617] text-white p-8 font-sans">
      <h1 className="text-3xl font-black text-yellow-500 mb-8 italic uppercase tracking-tighter">Admin Control Panel</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* User Distribution */}
        <div className="bg-white/5 p-6 rounded-3xl border border-white/10 flex flex-col">
          <div className="flex items-center gap-3 mb-8">
            <Globe className="text-blue-400" />
            <h2 className="text-xl font-bold uppercase tracking-widest">User Distribution</h2>
          </div>
          <div className="space-y-6">
            {stats.map((item, i) => {
              const percentage = totalUsers > 0 ? Math.round((item.value / totalUsers) * 100) : 0;
              return (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between items-end">
                    <span className="font-black text-yellow-500 uppercase tracking-tighter text-xs">{item.name}</span>
                    <span className="text-[10px] font-bold opacity-60">{percentage}% ({item.value} Users)</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-yellow-500 rounded-full transition-all duration-1000" style={{ width: `${percentage}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Manual Load */}
        <div className="bg-white/5 p-6 rounded-3xl border border-white/10 h-fit">
          <div className="flex items-center gap-3 mb-6 text-green-400">
            <PlusCircle />
            <h2 className="text-xl font-bold uppercase">Manual Minutes Load</h2>
          </div>
          <div className="space-y-4">
            <input type="text" placeholder="Phone (+256...)" className="w-full bg-black/50 border border-white/10 p-4 rounded-2xl outline-none focus:border-yellow-500" value={manualData.phone} onChange={(e) => e.target.value.startsWith("+") && setManualData({...manualData, phone: e.target.value})} />
            <input type="number" placeholder="Minutes" className="w-full bg-black/50 border border-white/10 p-4 rounded-2xl outline-none focus:border-yellow-500" value={manualData.minutes} onChange={(e) => setManualData({...manualData, minutes: e.target.value})} />
            <button onClick={handleManualUpdate} disabled={loading} className="w-full bg-yellow-500 text-black font-black p-4 rounded-2xl active:scale-95 transition-all uppercase tracking-widest shadow-lg">{loading ? "Updating..." : "Add Minutes Now"}</button>
          </div>
        </div>

        {/* EXCHANGE RATE CONTROL */}
        <div className="bg-white/5 p-6 rounded-3xl border border-white/10 md:col-span-2">
          <div className="flex items-center gap-3 mb-6 text-yellow-500">
            <Settings />
            <h2 className="text-xl font-bold uppercase">Exchange Rate Control</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
            
            {/* 📍 እቲ ዝተወሰኸ Dropdown መምረጺ ሃገራት (ብዝበለጸ UI) */}
            <div className="bg-black/40 p-4 rounded-2xl border border-white/5">
              <p className="text-[10px] opacity-40 uppercase font-black mb-2 italic">Select Currency</p>
              <select 
                value={selectedCurrency} 
                onChange={(e) => setSelectedCurrency(e.target.value)}
                className="w-full bg-transparent text-lg font-black text-yellow-500 outline-none cursor-pointer"
              >
                <option value="ETB" style={{ backgroundColor: "#020617", color: "#fff" }}>ETB - Ethiopia</option>
                <option value="UGX" style={{ backgroundColor: "#020617", color: "#fff" }}>UGX - Uganda</option>
                <option value="KES" style={{ backgroundColor: "#020617", color: "#fff" }}>KES - Kenya</option>
                <option value="AOA" style={{ backgroundColor: "#020617", color: "#fff" }}>AOA - Angola</option>
                <option value="SSP" style={{ backgroundColor: "#020617", color: "#fff" }}>SSP - South Sudan</option>
                <option value="SDG" style={{ backgroundColor: "#020617", color: "#fff" }}>SDG - Sudan</option>
              </select>
            </div>

            <div className="bg-black/40 p-4 rounded-2xl border border-white/5">
              <p className="text-[10px] opacity-40 uppercase font-black mb-3 italic">Rate Mode</p>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold">{rateSettings.useManual ? "MANUAL" : "AUTOMATIC"}</span>
                <button onClick={() => setRateSettings({...rateSettings, useManual: !rateSettings.useManual})} className={`w-12 h-6 rounded-full transition-all relative ${rateSettings.useManual ? 'bg-yellow-500' : 'bg-gray-600'}`}>
                  <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${rateSettings.useManual ? 'right-1' : 'left-1'}`} />
                </button>
              </div>
            </div>

            <div className="bg-black/40 p-4 rounded-2xl border border-white/5">
              <p className="text-[10px] opacity-40 uppercase font-black mb-1 italic">Set Value (1 USD = ?)</p>
              <input type="number" disabled={!rateSettings.useManual} placeholder="e.g. 155" className="w-full bg-transparent text-2xl font-black text-yellow-500 outline-none disabled:opacity-20" value={rateSettings.manualRate} onChange={(e) => setRateSettings({...rateSettings, manualRate: e.target.value})} />
            </div>

            <button onClick={updateExchangeRate} className="bg-blue-600 hover:bg-blue-500 text-white font-black p-5 rounded-2xl uppercase italic tracking-widest transition-all active:scale-95 shadow-lg w-full">Save Rate Settings</button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;