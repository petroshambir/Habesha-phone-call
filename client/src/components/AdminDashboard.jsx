
// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import { PlusCircle, Globe } from "lucide-react";

// const AdminDashboard = () => {
//   const [stats, setStats] = useState([]);
//   // Phone መጀመርታ "+" ንክህልዎ ንገብር
//   const [manualData, setManualData] = useState({ phone: "+", minutes: "" });
//   const [loading, setLoading] = useState(false);

//   useEffect(() => { fetchStats(); }, []);

// const fetchStats = async () => {
//   try {
//     const res = await axios.get("http://localhost:5000/api/admin/stats");
//     if (res.data.success) {
      
//       const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });

//       const formattedData = res.data.stats.map(item => {
//         let countryName = "Unknown";
//         try {
//           // item._id እቲ "UG" ወይ "ET" ሒዙ ዝመጸ እዩ
//           if (item._id && item._id !== "Unknown") {
//             countryName = regionNames.of(item._id);
//           }
//         } catch (e) {
//           countryName = item._id || "Other";
//         }
     
//         const [rateSettings, setRateSettings] = useState({ manualRate: "", useManual: false });

// const updateExchangeRate = async () => {
//     try {
//         await axios.post("http://localhost:5000/api/auth/admin/update-rate", {
//             currency: "ETB", // ወይ UGX
//             useManualRate: rateSettings.useManual,
//             manualRate: rateSettings.manualRate
//         });
//         alert("Settings Saved!");
//     } catch (err) { alert("Error!"); }
// };

//         return {
//           name: countryName,
//           value: item.count || 0 // <--- ኣብዚኣ እያ እታ መፍትሒ (item.count)
//         };
//       });
      
//       setStats(formattedData);
//     }
//   } catch (err) { 
//     console.error("Error fetching stats", err); 
//   }
// };

//   const handleManualUpdate = async () => {
//     // ቼክ ንገብር እንተተመሊኡ
//     if (manualData.phone === "+" || !manualData.minutes) return alert("በጃኻ ኩሉ መልእ!");
//     setLoading(true);
//     try {
//       const res = await axios.put("http://localhost:5000/api/admin/manual-update", {
//         phone: manualData.phone,
//         minutesToAdd: manualData.minutes
//       });
//       if (res.data.success) {
//         alert(`ተዓዊቱ! ሓድሽ ባላንስ: ${res.data.newBalance}`);
//         setManualData({ phone: "+", minutes: "" }); // Reset ምስ "+"
//         fetchStats();
//       }
//     } catch (err) { alert("ጌጋ ኣሎ!"); }
//     setLoading(false);
//   };

//   // ጠቕላላ ተጠቐምቲ ንምፍላጥ (ንፐርሰንት ዝጠቅም)
//   const totalUsers = stats.reduce((acc, curr) => acc + curr.value, 0);

//   return (
//     <div className="min-h-screen bg-[#020617] text-white p-8 font-sans">
//       <h1 className="text-3xl font-black text-yellow-500 mb-8 italic uppercase tracking-tighter italic">Admin Control Panel</h1>
      
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
//         {/* ጸጋም ወገን: በብሃገሩ ዘሎ ፐርሰንት (Voting Style) */}
//         <div className="bg-white/5 p-6 rounded-3xl border border-white/10 flex flex-col">
//           <div className="flex items-center gap-3 mb-8">
//             <Globe className="text-blue-400" />
//             <h2 className="text-xl font-bold uppercase tracking-widest">User Distribution</h2>
//           </div>

//           <div className="space-y-6">
//             {stats.length > 0 ? stats.map((item, i) => {
//               const percentage = totalUsers > 0 ? Math.round((item.value / totalUsers) * 100) : 0;
//               return (
//                 <div key={i} className="space-y-2">
//                   <div className="flex justify-between items-end">
//                     <span className="font-black text-yellow-500 uppercase tracking-tighter">{item.name}</span>
//                     <span className="text-xs font-bold opacity-60">{percentage}% ({item.value} Users)</span>
//                   </div>
//                   {/* Progress Bar (መስመር) */}
//                   <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
//                     <div 
//                       className="h-full bg-yellow-500 rounded-full transition-all duration-1000"
//                       style={{ width: `${percentage}%` }}
//                     ></div>
//                   </div>
//                 </div>
//               );
//             }) : <p className="opacity-20 italic">No data yet...</p>}
//           </div>
//         </div>

//         {/* ኣብቲ UI (Return) እዛ Card ወስኻ */}
// <div className="bg-white/5 p-6 rounded-3xl border border-white/10 mt-8">
//     <h2 className="text-xl font-bold uppercase mb-4">Exchange Rate Control</h2>
//     <div className="flex items-center justify-between mb-4">
//         <span>Use Manual Rate (ባዕልኻ ክትውስን)</span>
//         <button 
//             onClick={() => setRateSettings({...rateSettings, useManual: !rateSettings.useManual})}
//             className={`w-12 h-6 rounded-full transition-all ${rateSettings.useManual ? 'bg-yellow-500' : 'bg-gray-600'}`}
//         >
//             <div className={`w-4 h-4 bg-white rounded-full transition-all ${rateSettings.useManual ? 'translate-x-7' : 'translate-x-1'}`} />
//         </button>
//     </div>
//     <input 
//         type="number" 
//         placeholder="Enter Rate (e.g. 155)" 
//         className="w-full bg-black/50 p-4 rounded-2xl outline-none border border-white/10 mb-4"
//         value={rateSettings.manualRate}
//         onChange={(e) => setRateSettings({...rateSettings, manualRate: e.target.value})}
//     />
//     <button onClick={updateExchangeRate} className="w-full bg-blue-600 p-4 rounded-2xl font-black uppercase">Save Rate</button>
// </div>

//         {/* የማን ወገን: Manual Update Card */}
//         <div className="bg-white/5 p-6 rounded-3xl border border-white/10 h-fit">
//           <div className="flex items-center gap-3 mb-6 text-green-400">
//             <PlusCircle />
//             <h2 className="text-xl font-bold uppercase">Manual Minutes Load</h2>
//           </div>
//           <div className="space-y-4">
//             {/* Phone Input ምስ "+" Default */}
//             <div className="relative">
//               <input 
//                 type="text" 
//                 placeholder="Phone (e.g. 256...)" 
//                 className="w-full bg-black/50 border border-white/10 p-4 rounded-2xl outline-none focus:border-yellow-500 font-mono text-lg"
//                 value={manualData.phone}
//                 onChange={(e) => {
//                   const val = e.target.value;
//                   // "+" ንከይድመሰስ ንከላኸል
//                   if (val.startsWith("+")) {
//                     setManualData({...manualData, phone: val});
//                   }
//                 }} 
//               />
//             </div>

//             <input 
//               type="number" 
//               placeholder="Minutes to add" 
//               className="w-full bg-black/50 border border-white/10 p-4 rounded-2xl outline-none focus:border-yellow-500 font-mono"
//               value={manualData.minutes}
//               onChange={(e) => setManualData({...manualData, minutes: e.target.value})} 
//             />
            
//             <button 
//               onClick={handleManualUpdate} 
//               disabled={loading} 
//               className="w-full bg-yellow-500 text-black font-black p-4 rounded-2xl active:scale-95 transition-all uppercase tracking-widest shadow-lg shadow-yellow-500/10"
//             >
//               {loading ? "Updating..." : "Add Minutes Now"}
//             </button>
//           </div>
//         </div>

//       </div>
//     </div>
//   );
// };

// export default AdminDashboard;

// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import { PlusCircle, Globe, Settings } from "lucide-react";

// const AdminDashboard = () => {
// //   const [stats, setStats] = useState([]);
// //   const [manualData, setManualData] = useState({ phone: "+", minutes: "" });
// //   const [loading, setLoading] = useState(false);

// //   // --- 1. Exchange Rate Settings State (ኣብዚ ክኸውን ኣለዎ) ---
// //   const [rateSettings, setRateSettings] = useState({ manualRate: "", useManual: false });

// //   useEffect(() => { 
// //     fetchStats(); 
// //     fetchCurrentRate(); // እቲ ዝነበረ ዋጋ ካብ DB ንምምጻእ
// //   }, []);

// //   const fetchStats = async () => {
// //     try {
// //       const res = await axios.get("http://localhost:5000/api/admin/stats");
// //       if (res.data.success) {
// //         const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });
// //         const formattedData = res.data.stats.map(item => {
// //           let countryName = "Unknown";
// //           try {
// //             if (item._id && item._id !== "Unknown") {
// //               countryName = regionNames.of(item._id);
// //             }
// //           } catch (e) {
// //             countryName = item._id || "Other";
// //           }
// //           return {
// //             name: countryName,
// //             value: item.count || 0
// //           };
// //         });
// //         setStats(formattedData);
// //       }
// //     } catch (err) { 
// //       console.error("Error fetching stats", err); 
// //     }
// //   };

// //   // --- 2. እቲ ዝነበረ ዋጋ ካብ Backend ንምምጻእ ---
// //   const fetchCurrentRate = async () => {
// //     try {
// //       const res = await axios.get("http://localhost:5000/api/auth/get-current-rate/ETB");
// //       if (res.data.success && res.data.settings) {
// //         setRateSettings({
// //           manualRate: res.data.settings.manualRate,
// //           useManual: res.data.settings.useManualRate
// //         });
// //       }
// //     } catch (err) { console.log("No previous settings"); }
// //   };

// //   // --- 3. ዋጋ ሸርፊ ንምቕያር ዝሰርሕ ፋንክሽን ---
// //   const updateExchangeRate = async () => {
// //     try {
// //       await axios.post("http://localhost:5000/api/auth/admin/update-rate", {
// //         currency: "ETB", // ወይ ከምቲ ትደልዮ (UGX)
// //         useManualRate: rateSettings.useManual,
// //         manualRate: rateSettings.manualRate
// //       });
// //       alert("Settings Saved Successfully!");
// //     } catch (err) { alert("Error saving settings!"); }
// //   };

// //   const handleManualUpdate = async () => {
// //     if (manualData.phone === "+" || !manualData.minutes) return alert("በጃኻ ኩሉ መልእ!");
// //     setLoading(true);
// //     try {
// //       const res = await axios.put("http://localhost:5000/api/admin/manual-update", {
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

// const [stats, setStats] = useState([]);
//   const [manualData, setManualData] = useState({ phone: "+", minutes: "" });
//   const [loading, setLoading] = useState(false);

//   // --- 1. እቲ State (ብዲፎልት Automatic ማለት useManual: false እዩ) ---

// //   const [rateSettings, setRateSettings] = useState({ manualRate: "", useManual: false });

// //   useEffect(() => { 
// //     fetchStats(); 
// //     fetchCurrentRate(); 
// //   }, []);

// //   const fetchStats = async () => {
// //     try {
// //       const res = await axios.get("http://localhost:5000/api/admin/stats");
// //       if (res.data.success) {
// //         const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });
// //         const formattedData = res.data.stats.map(item => {
// //           let countryName = "Unknown";
// //           try {
// //             if (item._id && item._id !== "Unknown") {
// //               countryName = regionNames.of(item._id);
// //             }
// //           } catch (e) {
// //             countryName = item._id || "Other";
// //           }
// //           return {
// //             name: countryName,
// //             value: item.count || 0
// //           };
// //         });
// //         setStats(formattedData);
// //       }
// //     } catch (err) { 
// //       console.error("Error fetching stats", err); 
// //     }
// //   };

// //   // --- 2. እቲ ዝነበረ ዋጋ ካብ Backend ንምምጻእ ---
// //   const fetchCurrentRate = async () => {
// //     try {
// //       const res = await axios.get("http://localhost:5000/api/auth/get-current-rate/ETB");
// //       if (res.data.success && res.data.settings) {
// //         setRateSettings({
// //           manualRate: res.data.settings.manualRate,
// //           useManual: res.data.settings.useManualRate // እዚ ካብ DB ዝመጸ ይወስድ
// //         });
// //       }
// //     } catch (err) { 
// //         console.log("No previous settings"); 
// //         setRateSettings({ manualRate: "", useManual: false }); // እንተዘይተረኺቡ Automatic ይኹን
// //     }
// //   };

// //   // --- 3. ዋጋ ሸርፊ ንምቕያር ዝሰርሕ ፋንክሽን (እታ ዝተስተኻኸለት) ---
// //   const updateExchangeRate = async () => {
// //     try {
// //       await axios.post("http://localhost:5000/api/auth/admin/update-rate", {
// //         currency: "ETB",
// //         useManualRate: rateSettings.useManual, // እቲ Switch ዝሓዘቶ (True/False)
// //         manualRate: rateSettings.manualRate
// //       });
// //       alert("Settings Saved Successfully!");
// //     } catch (err) { 
// //       alert("Error saving settings!"); 
// //     }
// //   };

// // ... (እቲ ካልእ ኩሉ ስታቲስቲክስ ከም ዘለዎ ኣሎ)

//   const [rateSettings, setRateSettings] = useState({ manualRate: "", useManual: false });

//   useEffect(() => { 
//     fetchStats(); 
//     fetchCurrentRate(); 
//   }, []);

//   // ... (fetchStats ከም ዘለዎ)

//   const fetchCurrentRate = async () => {
//     try {
//       const res = await axios.get("http://localhost:5000/api/auth/get-current-rate/ETB");
//       if (res.data.success && res.data.settings) {
//         // እቲ ቁጽሪ ጥራሕ ነምጽኦ፡ እቲ Mode ግን ኩሉ ግዜ False (Automatic) ኮይኑ ይጅምር
//         setRateSettings({
//           manualRate: res.data.settings.manualRate,
//           useManual: false 
//         });
//       }
//     } catch (err) { 
//         console.log("No previous settings"); 
//         setRateSettings({ manualRate: "", useManual: false });
//     }
//   };

//   const updateExchangeRate = async () => {
//     try {
//       // ንስኻ "Save" ክትብል ከለኻ ዘሎ Mode (Manual/Auto) ናብ Backend ይኸይድ
//       await axios.post("http://localhost:5000/api/auth/admin/update-rate", {
//         currency: "ETB",
//         useManualRate: rateSettings.useManual, 
//         manualRate: rateSettings.manualRate
//       });
//       alert(`ተዓዊቱ! ሕጂ ኣብ ${rateSettings.useManual ? "MANUAL" : "AUTOMATIC"} Mode ኣሎ።`);
//     } catch (err) { 
//       alert("Error saving settings!"); 
//     }
//   };


//   const handleManualUpdate = async () => {
//     if (manualData.phone === "+" || !manualData.minutes) return alert("በጃኻ ኩሉ መልእ!");
//     setLoading(true);
//     try {
//       const res = await axios.put("http://localhost:5000/api/admin/manual-update", {
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
//         <div className="bg-white/5 p-6 rounded-3xl border border-white/10 flex flex-col text-white">
//           <div className="flex items-center gap-3 mb-8">
//             <Globe className="text-blue-400" />
//             <h2 className="text-xl font-bold uppercase tracking-widest text-white">User Distribution</h2>
//           </div>

//           <div className="space-y-6">
//             {stats.length > 0 ? stats.map((item, i) => {
//               const percentage = totalUsers > 0 ? Math.round((item.value / totalUsers) * 100) : 0;
//               return (
//                 <div key={i} className="space-y-2">
//                   <div className="flex justify-between items-end">
//                     <span className="font-black text-yellow-500 uppercase tracking-tighter">{item.name}</span>
//                     <span className="text-xs font-bold opacity-60 text-white">{percentage}% ({item.value} Users)</span>
//                   </div>
//                   <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
//                     <div 
//                       className="h-full bg-yellow-500 rounded-full transition-all duration-1000"
//                       style={{ width: `${percentage}%` }}
//                     ></div>
//                   </div>
//                 </div>
//               );
//             }) : <p className="opacity-20 italic text-white">No data yet...</p>}
//           </div>
//         </div>

//         {/* Manual Minutes Load */}
//         <div className="bg-white/5 p-6 rounded-3xl border border-white/10 h-fit text-white">
//           <div className="flex items-center gap-3 mb-6 text-green-400">
//             <PlusCircle />
//             <h2 className="text-xl font-bold uppercase text-white">Manual Minutes Load</h2>
//           </div>
//           <div className="space-y-4">
//             <input 
//               type="text" 
//               placeholder="Phone (e.g. 256...)" 
//               className="w-full bg-black/50 border border-white/10 p-4 rounded-2xl outline-none focus:border-yellow-500 font-mono text-lg text-white"
//               value={manualData.phone}
//               onChange={(e) => e.target.value.startsWith("+") && setManualData({...manualData, phone: e.target.value})} 
//             />
//             <input 
//               type="number" 
//               placeholder="Minutes to add" 
//               className="w-full bg-black/50 border border-white/10 p-4 rounded-2xl outline-none focus:border-yellow-500 font-mono text-white"
//               value={manualData.minutes}
//               onChange={(e) => setManualData({...manualData, minutes: e.target.value})} 
//             />
//             <button 
//               onClick={handleManualUpdate} 
//               disabled={loading} 
//               className="w-full bg-yellow-500 text-black font-black p-4 rounded-2xl active:scale-95 transition-all uppercase tracking-widest shadow-lg"
//             >
//               {loading ? "Updating..." : "Add Minutes Now"}
//             </button>
//           </div>
//         </div>

//         {/* --- EXCHANGE RATE CONTROL CARD --- */}
//         <div className="bg-white/5 p-6 rounded-3xl border border-white/10 md:col-span-2 text-white">
//           <div className="flex items-center gap-3 mb-6 text-yellow-500">
//             <Settings />
//             <h2 className="text-xl font-bold uppercase text-white">Exchange Rate Control</h2>
//           </div>
          
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
//             <div className="bg-black/40 p-4 rounded-2xl border border-white/5">
//               <p className="text-[10px] opacity-40 uppercase font-black mb-3">Rate Mode</p>
//               <div className="flex items-center justify-between">
//                 <span className="text-sm font-bold text-white">{rateSettings.useManual ? "MANUAL" : "AUTOMATIC"}</span>
//                 <button 
//                   onClick={() => setRateSettings({...rateSettings, useManual: !rateSettings.useManual})}
//                   className={`w-12 h-6 rounded-full transition-all relative ${rateSettings.useManual ? 'bg-yellow-500' : 'bg-gray-600'}`}
//                 >
//                   <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${rateSettings.useManual ? 'right-1' : 'left-1'}`} />
//                 </button>
//               </div>
//             </div>

//             <div className="bg-black/40 p-4 rounded-2xl border border-white/5">
//               <p className="text-[10px] opacity-40 uppercase font-black mb-1">Set Value (1 USD = ?)</p>
//               <input 
//                 type="number" 
//                 disabled={!rateSettings.useManual}
//                 placeholder="e.g. 155" 
//                 className="w-full bg-transparent text-2xl font-black text-yellow-500 outline-none disabled:opacity-20"
//                 value={rateSettings.manualRate}
//                 onChange={(e) => setRateSettings({...rateSettings, manualRate: e.target.value})}
//               />
//             </div>

//             <button 
//               onClick={updateExchangeRate}
//               className="bg-blue-600 hover:bg-blue-500 text-white font-black p-5 rounded-2xl uppercase italic tracking-widest transition-all active:scale-95 shadow-lg"
//             >
//               Save Rate Settings
//             </button>
//           </div>
//         </div>

//       </div>
//     </div>
//   );
// };

// export default AdminDashboard;

// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import { PlusCircle, Globe, Settings } from "lucide-react";

// const AdminDashboard = () => {
//   const [stats, setStats] = useState([]);
//   const [manualData, setManualData] = useState({ phone: "+", minutes: "" });
//   const [loading, setLoading] = useState(false);

//   // --- 1. እቲ State (ኩሉ ግዜ ብ Automatic ይጅምር) ---
//   const [rateSettings, setRateSettings] = useState({ manualRate: "", useManual: false });

//   useEffect(() => { 
//     fetchStats(); 
//     fetchCurrentRate(); 
//   }, []);

//   // --- 2. እታ Error ዝፈጠረት fetchStats ፋንክሽን መሊሰያ ኣለኹ ---
//   const fetchStats = async () => {
//     try {
//       const res = await axios.get("http://localhost:5000/api/admin/stats");
//       if (res.data.success) {
//         const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });
//         const formattedData = res.data.stats.map(item => {
//           let countryName = "Unknown";
//           try {
//             if (item._id && item._id !== "Unknown") {
//               countryName = regionNames.of(item._id);
//             }
//           } catch (e) {
//             countryName = item._id || "Other";
//           }
//           return {
//             name: countryName,
//             value: item.count || 0
//           };
//         });
//         setStats(formattedData);
//       }
//     } catch (err) { 
//       console.error("Error fetching stats", err); 
//     }
//   };

// //   const fetchCurrentRate = async () => {
// //     try {
// //       const res = await axios.get("http://localhost:5000/api/auth/get-current-rate/ETB");
// //       if (res.data.success && res.data.settings) {
// //         // እቲ ዋጋ ካብ DB ነምጽኦ፡ እቲ Mode ግን False (Automatic) ይኹን
// //         setRateSettings({
// //           manualRate: res.data.settings.manualRate,
// //           useManual: false 
// //         });
// //       }
// //     } catch (err) { 
// //         console.log("No previous settings"); 
// //         setRateSettings({ manualRate: "", useManual: false });
// //     }
// //   };

// //   const updateExchangeRate = async () => {
// //     try {
// //       await axios.post("http://localhost:5000/api/auth/admin/update-rate", {
// //         currency: "ETB",
// //         useManualRate: rateSettings.useManual, 
// //         manualRate: rateSettings.manualRate
// //       });
// //       alert(`ተዓዊቱ! ሕጂ ኣብ ${rateSettings.useManual ? "MANUAL" : "AUTOMATIC"} Mode ኣሎ።`);
// //     } catch (err) { 
// //       alert("Error saving settings!"); 
// //     }
// //   };

// const updateExchangeRate = async () => {
//     try {
//       // እቲ ዳታ ብልክዕ ይኸይድ ምህላዉ ነረጋግጽ
//       const response = await axios.post("http://localhost:5000/api/auth/admin/update-rate", {
//         currency: "ETB",
//         useManualRate: rateSettings.useManual, // እታ Switch ዝሓዘቶ Mode (True/False)
//         manualRate: rateSettings.manualRate
//       });
      
//       if (response.data.success) {
//         alert(`ተዓዊቱ! ሕጂ ኣብ ${rateSettings.useManual ? "MANUAL" : "AUTOMATIC"} Mode ኣሎ።`);
//       }
//     } catch (err) { 
//       alert("Error saving settings!"); 
//     }
//   };
// const fetchCurrentRate = async () => {
//     try {
//       // ኣብዚኣ Currency ንምምጻእ ንጥቀም (ንኣብነት UGX ወይ ETB)
//       const res = await axios.get("http://localhost:5000/api/auth/get-current-rate/UGX"); 
//       if (res.data.success && res.data.settings) {
//         setRateSettings({
//           manualRate: res.data.settings.manualRate,
//           // *** እዛ መስመር እያ እታ መፍትሒ፡ ካብ DB እቲ Mode ተምጽኦ ***
//           useManual: res.data.settings.useManualRate 
//         });
//       }
//     } catch (err) { 
//         console.log("No previous settings found"); 
//     }
//   }; 

//   const handleManualUpdate = async () => {
//     if (manualData.phone === "+" || !manualData.minutes) return alert("በጃኻ ኩሉ መልእ!");
//     setLoading(true);
//     try {
//       const res = await axios.put("http://localhost:5000/api/admin/manual-update", {
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
//         <div className="bg-white/5 p-6 rounded-3xl border border-white/10 flex flex-col text-white">
//           <div className="flex items-center gap-3 mb-8">
//             <Globe className="text-blue-400" />
//             <h2 className="text-xl font-bold uppercase tracking-widest text-white">User Distribution</h2>
//           </div>

//           <div className="space-y-6">
//             {stats.length > 0 ? stats.map((item, i) => {
//               const percentage = totalUsers > 0 ? Math.round((item.value / totalUsers) * 100) : 0;
//               return (
//                 <div key={i} className="space-y-2">
//                   <div className="flex justify-between items-end">
//                     <span className="font-black text-yellow-500 uppercase tracking-tighter text-xs">{item.name}</span>
//                     <span className="text-[10px] font-bold opacity-60 text-white">{percentage}% ({item.value} Users)</span>
//                   </div>
//                   <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
//                     <div className="h-full bg-yellow-500 rounded-full transition-all duration-1000" style={{ width: `${percentage}%` }}></div>
//                   </div>
//                 </div>
//               );
//             }) : <p className="opacity-20 italic text-white text-sm">No data yet...</p>}
//           </div>
//         </div>

//         {/* Manual Minutes Load */}
//         <div className="bg-white/5 p-6 rounded-3xl border border-white/10 h-fit text-white">
//           <div className="flex items-center gap-3 mb-6 text-green-400">
//             <PlusCircle />
//             <h2 className="text-xl font-bold uppercase text-white">Manual Minutes Load</h2>
//           </div>
//           <div className="space-y-4">
//             <input 
//               type="text" 
//               placeholder="Phone (+256...)" 
//               className="w-full bg-black/50 border border-white/10 p-4 rounded-2xl outline-none focus:border-yellow-500 text-white"
//               value={manualData.phone}
//               onChange={(e) => e.target.value.startsWith("+") && setManualData({...manualData, phone: e.target.value})} 
//             />
//             <input 
//               type="number" 
//               placeholder="Minutes to add" 
//               className="w-full bg-black/50 border border-white/10 p-4 rounded-2xl outline-none focus:border-yellow-500 text-white"
//               value={manualData.minutes}
//               onChange={(e) => setManualData({...manualData, minutes: e.target.value})} 
//             />
//             <button 
//               onClick={handleManualUpdate} 
//               disabled={loading} 
//               className="w-full bg-yellow-500 text-black font-black p-4 rounded-2xl active:scale-95 transition-all uppercase tracking-widest shadow-lg"
//             >
//               {loading ? "Updating..." : "Add Minutes Now"}
//             </button>
//           </div>
//         </div>

//         {/* EXCHANGE RATE CONTROL */}
//         <div className="bg-white/5 p-6 rounded-3xl border border-white/10 md:col-span-2 text-white">
//           <div className="flex items-center gap-3 mb-6 text-yellow-500">
//             <Settings />
//             <h2 className="text-xl font-bold uppercase text-white">Exchange Rate Control</h2>
//           </div>
          
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
//             <div className="bg-black/40 p-4 rounded-2xl border border-white/5">
//               <p className="text-[10px] opacity-40 uppercase font-black mb-3 italic">Rate Mode</p>
//               <div className="flex items-center justify-between">
//                 <span className="text-sm font-bold text-white tracking-widest">{rateSettings.useManual ? "MANUAL" : "AUTOMATIC"}</span>
//                 <button 
//                   onClick={() => setRateSettings({...rateSettings, useManual: !rateSettings.useManual})}
//                   className={`w-12 h-6 rounded-full transition-all relative ${rateSettings.useManual ? 'bg-yellow-500' : 'bg-gray-600'}`}
//                 >
//                   <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${rateSettings.useManual ? 'right-1' : 'left-1'}`} />
//                 </button>
//               </div>
//             </div>

//             <div className="bg-black/40 p-4 rounded-2xl border border-white/5">
//               <p className="text-[10px] opacity-40 uppercase font-black mb-1 italic">Set Value (1 USD = ?)</p>
//               <input 
//                 type="number" 
//                 disabled={!rateSettings.useManual}
//                 placeholder="e.g. 155" 
//                 className="w-full bg-transparent text-2xl font-black text-yellow-500 outline-none disabled:opacity-20"
//                 value={rateSettings.manualRate}
//                 onChange={(e) => setRateSettings({...rateSettings, manualRate: e.target.value})}
//               />
//             </div>

//             <button 
//               onClick={updateExchangeRate}
//               className="bg-blue-600 hover:bg-blue-500 text-white font-black p-5 rounded-2xl uppercase italic tracking-widest transition-all active:scale-95 shadow-lg shadow-blue-900/20"
//             >
//               Save Rate Settings
//             </button>
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

  // --- 1. እቲ State (ብዲፎልት Automatic ይኹን፡ ግን ካብ Database ይጽበ) ---
  const [rateSettings, setRateSettings] = useState({ manualRate: "", useManual: false });

  useEffect(() => { 
    fetchStats(); 
    fetchCurrentRate(); 
  }, []);

  const fetchStats = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/admin/stats");
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

//   const fetchCurrentRate = async () => {
//     try {
//       // ንኹሉ Currency ሓደ ዓይነት Settings ስለዘለካ "ETB" ንጥቀም
//       const res = await axios.get("http://localhost:5000/api/auth/get-current-rate/ETB"); 
//       if (res.data.success && res.data.settings) {
//         setRateSettings({
//           manualRate: res.data.settings.manualRate,
//           useManual: false // ኩሉ ግዜ ምስ ከፈትካዮ ብ Auto ንኪጅምር
//         });
//       }
//     } catch (err) { console.log("No previous settings found"); }
//   }; 

const fetchCurrentRate = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/auth/get-current-rate/ETB"); 
      if (res.data.success && res.data.settings) {
        setRateSettings({
          manualRate: res.data.settings.manualRate,
          // *** እዛ መስመር እያ እታ መፍትሒ: ካብ DB እቲ ዝነበረ Mode (True/False) የውጽኦ ***
          useManual: res.data.settings.useManualRate 
        });
      }
    } catch (err) { 
        console.log("No previous settings found"); 
    }
  };

  const updateExchangeRate = async () => {
    try {
      const response = await axios.post("http://localhost:5000/api/auth/admin/update-rate", {
        currency: "ETB",
        useManualRate: rateSettings.useManual, 
        manualRate: rateSettings.manualRate
      });
      if (response.data.success) {
        alert(`ተዓዊቱ! ሕጂ ኣብ ${rateSettings.useManual ? "MANUAL" : "AUTOMATIC"} Mode ኣሎ።`);
      }
    } catch (err) { alert("Error saving settings!"); }
  };



  const handleManualUpdate = async () => {
    if (manualData.phone === "+" || !manualData.minutes) return alert("በጃኻ ኩሉ መልእ!");
    setLoading(true);
    try {
      const res = await axios.put("http://localhost:5000/api/admin/manual-update", {
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
      <h1 className="text-3xl font-black text-yellow-500 mb-8 italic uppercase tracking-tighter italic">Admin Control Panel</h1>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
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
            <button onClick={updateExchangeRate} className="bg-blue-600 hover:bg-blue-500 text-white font-black p-5 rounded-2xl uppercase italic tracking-widest transition-all active:scale-95 shadow-lg">Save Rate Settings</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;