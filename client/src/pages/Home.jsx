
// import { useState, useEffect, useRef } from "react";
// import axios from "axios";
// import { Phone, PhoneOff, Delete, Volume2, VolumeX, LogOut, Clock, Grid, CreditCard } from "lucide-react";
// import { useNavigate, useLocation } from "react-router-dom"; // useLocation ተወሲኻ ኣላ

// function Home({ phone, onLogout }) {
//   const navigate = useNavigate();
//   const location = useLocation(); // <--- እዚኣ ኣገዳሲት እያ
//   const [number, setNumber] = useState("");
//   const [isCalling, setIsCalling] = useState(false);
//   const [isAnswered, setIsAnswered] = useState(false);
//   const [secondsLeft, setSecondsLeft] = useState(0);
//   const [callStatus, setCallStatus] = useState(null);
//   const [isSpeakerOn, setIsSpeakerOn] = useState(false);
//   const [activeTab, setActiveTab] = useState("keypad");

//   const [callHistory, setCallHistory] = useState(() => {
//     const saved = localStorage.getItem("callHistory");
//     return saved ? JSON.parse(saved) : [];
//   });

//   // Home.jsx ውሽጢ እዛ function ተካኣ
// const parseToSeconds = (timeStr) => {
//   if (!timeStr || typeof timeStr !== 'string' || !timeStr.includes(':')) return 0;
//   const [m, s] = timeStr.split(':').map(val => parseInt(val) || 0);
//   return (m * 60) + s;
// };

//   const audioRef = useRef(new Audio("/sounds/ringings.mp3"));
//   const beepRef = useRef(new Audio("/sounds/dialing.mp3"));
//   const warningVoice = useRef(new Audio("/sounds/dialings.mp3"));

//   useEffect(() => {
//     localStorage.setItem("callHistory", JSON.stringify(callHistory));
//   }, [callHistory]);

//   // --- Logic Helpers ---
//   const formatToDisplay = (totalSeconds) => {
//     const mins = Math.floor(totalSeconds / 60);
//     const secs = totalSeconds % 60;
//     return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
//   };


//   // ካብ Database ባላንስ ንምምጻእ

//   const fetchMinutesFromDB = async () => {
//     // 1. ካብ Props ወይ localStorage ነቲ ቁጽሪ ነምጽእ
//     let userPhone = phone || location.state?.userPhone || localStorage.getItem("userPhone");

//     if (!userPhone || userPhone === "No Phone") return;

//     // *** ኣገዳሲት መፍትሒ ***
//     // እቲ ቁጽሪ ብ '+' ከም ዝጅምር ነረጋግጽ፡ እንተዘይሃልዩ ንውስኸሉ
//     if (!userPhone.startsWith('+')) {
//       userPhone = `+${userPhone}`;
//     }

//     try {
//       const response = await axios.get(`http://localhost:5000/api/auth/user-minutes?phone=${encodeURIComponent(userPhone)}`);
//       if (response.data.success) {
//         setSecondsLeft(parseToSeconds(response.data.minutes));
//         // ነቲ ዝተስተኻኸለ ቁጽሪ (ምስ + ዘሎ) ንዕቅቦ
//         localStorage.setItem("userPhone", userPhone);
//       }
//     } catch (error) { 
//       console.error("Fetch Error", error); 
//     }
//   };
  
//   const syncMinutesWithDB = async (currentSeconds) => {
//     const userPhone = phone || location.state?.userPhone || localStorage.getItem("userPhone");
//     if (!userPhone) return;
//     try {
//       await axios.put('http://localhost:5000/api/auth/update-minutes', {
//         phone: userPhone,
//         remainingMinutes: formatToDisplay(currentSeconds)
//       });
//     } catch (err) { console.error("❌ DB Update Error"); }
//   };

//   // --- Real-time Refresh Logic ---
//   useEffect(() => {
//     fetchMinutesFromDB(); 

//     // ገጽ Focus ምስ ገበረ ባዕሉ ዳታ የሐድስ
//     window.addEventListener("focus", fetchMinutesFromDB);
//     return () => window.removeEventListener("focus", fetchMinutesFromDB);
//   }, [phone, location.state?.refresh]); // <--- እታ refresh ምስ ተላእከት ባዕሉ Update ይገብር

//   useEffect(() => {
//     let timerInterval;
//     if (isCalling && isAnswered && secondsLeft > 0) {
//       timerInterval = setInterval(() => {
//         setSecondsLeft(prev => {
//           const nextValue = prev - 1;
//           if (nextValue <= 0) { handleHangUp(); return 0; }
          
//           if (nextValue % 10 === 0) {
//             syncMinutesWithDB(nextValue);
//           }
          
//           if (nextValue === 60) warningVoice.current.play();
//           return nextValue;
//         });
//       }, 1000);
//     }
//     return () => clearInterval(timerInterval);
//   }, [isCalling, isAnswered]);

//   const handleHangUp = async () => {
//     await syncMinutesWithDB(secondsLeft); 
//     if (number) {
//       setCallHistory(prev => [{
//         to: number,
//         time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
//         date: new Date().toLocaleDateString(),
//         status: isAnswered ? "Answered" : "Missed"
//       }, ...prev]);
//     }
//     setIsCalling(false);
//     setIsAnswered(false);
//     setCallStatus(null);
//     setNumber("");
//     audioRef.current.pause();
//     audioRef.current.currentTime = 0;
//   };

//   const startCall = (customNumber = null) => {
//     const targetNumber = customNumber || number;
//     if (!targetNumber || targetNumber.trim().length < 10) return alert("Enter a valid number!");
//     if (secondsLeft <= 0) return alert("No minutes left! Please buy a card.");
//     setIsCalling(true);
//     setCallStatus('ringing');
//     setIsAnswered(false);
//     audioRef.current.loop = true;
//     audioRef.current.play().catch(() => { });
//     setTimeout(() => { 
//         setIsAnswered(true); 
//         setCallStatus('connected'); 
//         audioRef.current.pause();
//     }, 3000);
//   };

//   const handleKeyClick = (val) => {
//     if (beepRef.current) { beepRef.current.currentTime = 0; beepRef.current.play().catch(() => { }); }
//     setNumber(prev => prev + val);
//   };

//   const handleDelete = () => {
//     setNumber(prev => prev.slice(0, -1));
//   };

//   const toggleSpeaker = () => {
//     const newState = !isSpeakerOn;
//     setIsSpeakerOn(newState);
//     if (audioRef.current) audioRef.current.volume = newState ? 1.0 : 0.2;
//   };

//   const dialPadKeys = [
//     { key: 1, letters: '' }, { key: 2, letters: 'ABC' }, { key: 3, letters: 'DEF' },
//     { key: 4, letters: 'GHI' }, { key: 5, letters: 'JKL' }, { key: 6, letters: 'MNO' },
//     { key: 7, letters: 'PQRS' }, { key: 8, letters: 'TUV' }, { key: 9, letters: 'WXYZ' },
//     { key: '+', letters: '' }, { key: 0, letters: '' }, { key: '#', letters: '' }
//   ];

//   return (
//     <div className="fixed inset-0 w-full flex flex-col items-center select-none overflow-hidden"
//       style={{ background: "#020617", color: "white" }}>

//       <div className="w-full flex justify-between items-start px-6 py-4 shrink-0">
//         <div className="flex flex-col gap-2">
//           <button onClick={onLogout} className="bg-red-600/90 active:scale-95 p-2 px-3 rounded-xl text-[10px] font-black shadow-lg flex items-center gap-1 uppercase tracking-tighter">
//             <LogOut size={14} /> LOGOUT
//           </button>
//           <button onClick={() => navigate("/buy-card")} className="bg-green-600/90 active:scale-95 p-2 px-3 rounded-xl text-[10px] font-black shadow-lg flex items-center gap-1 uppercase tracking-tighter">
//             <CreditCard size={14} /> Buy Card
//           </button>
//         </div>
//         <div className="text-right text-yellow-500 font-black italic">
//           Habesha Tele
//           <p className="text-[10px] text-white opacity-50 font-mono">{phone || localStorage.getItem("userPhone")}</p>
//         </div>
//       </div>

//       <div className="text-center mb-1 shrink-0 cursor-pointer active:scale-95" onClick={fetchMinutesFromDB}>
//         <p className="text-[9px] uppercase tracking-widest opacity-60 mb-1 font-bold">Remaining Balance</p>
//         <p className={`text-5xl font-black ${secondsLeft < 60 ? "text-red-500 animate-pulse" : "text-yellow-400"}`}>
//           {formatToDisplay(secondsLeft)}
//         </p>
//       </div>

//       <div className="flex-1 w-full max-sm flex flex-col justify-between px-6 pb-2 min-h-0 overflow-hidden">
//         {activeTab === "keypad" ? (
//           <div className="flex flex-col h-full justify-evenly">
//             <div className="shrink-0 text-center">
//               <div className="text-white text-4xl font-light h-12 italic tracking-widest">{number || " "}</div>
//               <div className="h-4 mt-1">
//                 {callStatus === 'ringing' && <p className="text-green-400 text-[9px] animate-pulse font-bold uppercase">Calling...</p>}
//                 {isAnswered && <p className="text-yellow-400 text-[9px] font-bold uppercase animate-bounce">In Call</p>}
//               </div>
//             </div>

//             <div className="grid grid-cols-3 gap-y-2 gap-x-4 max-w-[260px] mx-auto">
//               {dialPadKeys.map(({ key, letters }) => (
//                 <button key={key} onClick={() => handleKeyClick(key)} className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white/5 border border-white/10 flex flex-col items-center justify-center active:bg-white/20 active:scale-90 transition-all mx-auto">
//                   <span className="text-xl sm:text-2xl font-bold">{key}</span>
//                   <span className="text-[7px] opacity-40 uppercase">{letters}</span>
//                 </button>
//               ))}
//             </div>

//             <div className="flex justify-between items-center px-4 shrink-0">
//               <button onClick={toggleSpeaker} className={`p-4 rounded-full ${isSpeakerOn ? 'bg-yellow-400 text-black shadow-lg' : 'bg-white/5 border border-white/10'}`}>
//                 {isSpeakerOn ? <Volume2 size={22} /> : <VolumeX size={22} />}
//               </button>
//               <button className={`p-6 rounded-full shadow-xl ${isCalling ? 'bg-red-500 animate-pulse' : 'bg-green-500 active:scale-90'}`} onClick={isCalling ? handleHangUp : startCall}>
//                 {isCalling ? <PhoneOff size={28} fill="white" /> : <Phone size={28} fill="white" />}
//               </button>
//               <button className="p-4 rounded-full bg-white/5 border border-white/10 active:bg-red-500/10 active:text-red-400 transition-colors" onClick={handleDelete}>
//                 <Delete size={22} />
//               </button>
//             </div>
//           </div>
//         ) : (
//           <div className="flex flex-col h-full pt-2 pb-4">
//             <h2 className="text-base font-black text-yellow-500 uppercase tracking-widest border-b border-white/5 pb-2 mb-4">Call History</h2>
//             <div className="flex-1 overflow-y-auto space-y-2">
//               {callHistory.length === 0 ? <p className="text-center opacity-30 mt-20 text-xs italic">No call logs yet</p> :
//                 callHistory.map((log, i) => (
//                   <div key={i} className="bg-white/5 p-3 rounded-xl flex justify-between items-center border border-white/5">
//                     <div>
//                       <p className="font-bold text-sm text-yellow-50">{log.to}</p>
//                       <p className="text-[9px] opacity-40 uppercase">{log.date} • {log.time}</p>
//                     </div>
//                     <Phone size={14} className="text-green-400" />
//                   </div>
//                 ))}
//             </div>
//           </div>
//         )}
//       </div>

//       <div className="w-full bg-black/90 backdrop-blur-xl border-t border-white/10 flex justify-around items-center py-3 shrink-0">
//         <button onClick={() => setActiveTab("history")} className={`flex flex-col items-center gap-1 flex-1 py-1 transition-colors ${activeTab === "history" ? "text-yellow-400" : "text-white/20"}`}>
//           <Clock size={20} /> <span className="text-[9px] font-black uppercase tracking-widest">History</span>
//         </button>
//         <button onClick={() => setActiveTab("keypad")} className={`flex flex-col items-center gap-1 flex-1 py-1 transition-colors ${activeTab === "keypad" ? "text-yellow-400" : "text-white/20"}`}>
//           <Grid size={20} /> <span className="text-[9px] font-black uppercase tracking-widest">Keypad</span>
//         </button>
//       </div>
//     </div>
//   );
// }

// export default Home;



// import { useState, useEffect, useRef } from "react";
// import axios from "axios";
// import { Phone, PhoneOff, Delete, Volume2, VolumeX, LogOut, Clock, Grid, CreditCard } from "lucide-react";
// import { useNavigate, useLocation } from "react-router-dom"; 

// function Home({ phone, onLogout }) {
//   const navigate = useNavigate();
//   const location = useLocation(); 
//   const [number, setNumber] = useState("");
//   const [isCalling, setIsCalling] = useState(false);
//   const [isAnswered, setIsAnswered] = useState(false);
//   const [secondsLeft, setSecondsLeft] = useState(0);
//   const [callStatus, setCallStatus] = useState(null);
//   const [isSpeakerOn, setIsSpeakerOn] = useState(false);
//   const [activeTab, setActiveTab] = useState("keypad");

//   const inputRef = useRef(null);

//   const [callHistory, setCallHistory] = useState(() => {
//     const saved = localStorage.getItem("callHistory");
//     return saved ? JSON.parse(saved) : [];
//   });

//   const parseToSeconds = (timeStr) => {
//     if (!timeStr || typeof timeStr !== 'string' || !timeStr.includes(':')) return 0;
//     const [m, s] = timeStr.split(':').map(val => parseInt(val) || 0);
//     return (m * 60) + s;
//   };

//   const audioRef = useRef(new Audio("/sounds/ringings.mp3"));
//   const beepRef = useRef(new Audio("/sounds/dialing.mp3"));
//   const warningVoice = useRef(new Audio("/sounds/dialings.mp3"));

//   useEffect(() => {
//     localStorage.setItem("callHistory", JSON.stringify(callHistory));
//   }, [callHistory]);

//   const formatToDisplay = (totalSeconds) => {
//     const mins = Math.floor(totalSeconds / 60);
//     const secs = totalSeconds % 60;
//     return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
//   };

//   const fetchMinutesFromDB = async () => {
//     let userPhone = phone || location.state?.userPhone || localStorage.getItem("userPhone");
//     if (!userPhone || userPhone === "No Phone") return;
//     if (!userPhone.startsWith('+')) { userPhone = `+${userPhone}`; }

//     try {
//       const response = await axios.get(`http://localhost:5000/api/auth/user-minutes?phone=${encodeURIComponent(userPhone)}`);
//       if (response.data.success) {
//         setSecondsLeft(parseToSeconds(response.data.minutes));
//         localStorage.setItem("userPhone", userPhone);
//       }
//     } catch (error) { console.error("Fetch Error", error); }
//   };
  
//   const syncMinutesWithDB = async (currentSeconds) => {
//     const userPhone = phone || location.state?.userPhone || localStorage.getItem("userPhone");
//     if (!userPhone) return;
//     try {
//       await axios.put('http://localhost:5000/api/auth/update-minutes', {
//         phone: userPhone,
//         remainingMinutes: formatToDisplay(currentSeconds)
//       });
//     } catch (err) { console.error("❌ DB Update Error"); }
//   };

//   useEffect(() => {
//     fetchMinutesFromDB(); 
//     window.addEventListener("focus", fetchMinutesFromDB);
//     return () => window.removeEventListener("focus", fetchMinutesFromDB);
//   }, [phone, location.state?.refresh]);

//   useEffect(() => {
//     let timerInterval;
//     if (isCalling && isAnswered && secondsLeft > 0) {
//       timerInterval = setInterval(() => {
//         setSecondsLeft(prev => {
//           const nextValue = prev - 1;
//           if (nextValue <= 0) { handleHangUp(); return 0; }
//           if (nextValue % 10 === 0) { syncMinutesWithDB(nextValue); }
//           if (nextValue === 60) warningVoice.current.play();
//           return nextValue;
//         });
//       }, 1000);
//     }
//     return () => clearInterval(timerInterval);
//   }, [isCalling, isAnswered]);

//   const handleHangUp = async () => {
//     await syncMinutesWithDB(secondsLeft); 
//     if (number) {
//       setCallHistory(prev => [{
//         to: number,
//         time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
//         date: new Date().toLocaleDateString(),
//         status: isAnswered ? "Answered" : "Missed"
//       }, ...prev]);
//     }
//     setIsCalling(false);
//     setIsAnswered(false);
//     setCallStatus(null);
//     setNumber("");
//     audioRef.current.pause();
//     audioRef.current.currentTime = 0;
//   };

//   const startCall = (customNumber = null) => {
//     const targetNumber = customNumber || number;
//     if (!targetNumber || targetNumber.trim().length < 10) return alert("Enter a valid number!");
//     if (secondsLeft <= 0) return alert("No minutes left! Please buy a card.");
//     setIsCalling(true);
//     setCallStatus('ringing');
//     setIsAnswered(false);
//     audioRef.current.loop = true;
//     audioRef.current.play().catch(() => { });
//     setTimeout(() => { 
//         setIsAnswered(true); 
//         setCallStatus('connected'); 
//         audioRef.current.pause();
//     }, 3000);
//   };

//   const handleKeyClick = (val) => {
//     if (beepRef.current) { beepRef.current.currentTime = 0; beepRef.current.play().catch(() => { }); }
    
//     const input = inputRef.current;
//     const start = input.selectionStart;
//     const end = input.selectionEnd;
//     const newNumber = number.substring(0, start) + val + number.substring(end);
    
//     setNumber(newNumber);

//     setTimeout(() => {
//       input.focus();
//       input.setSelectionRange(start + 1, start + 1);
//     }, 0);
//   };

//   const handleDelete = () => {
//     const input = inputRef.current;
//     const start = input.selectionStart;
//     const end = input.selectionEnd;

//     if (start === end && start > 0) {
//       const newNumber = number.substring(0, start - 1) + number.substring(end);
//       setNumber(newNumber);
//       setTimeout(() => {
//         input.focus();
//         input.setSelectionRange(start - 1, start - 1);
//       }, 0);
//     } else if (start !== end) {
//       const newNumber = number.substring(0, start) + number.substring(end);
//       setNumber(newNumber);
//       setTimeout(() => {
//         input.focus();
//         input.setSelectionRange(start, start);
//       }, 0);
//     }
//   };

//   const toggleSpeaker = () => {
//     const newState = !isSpeakerOn;
//     setIsSpeakerOn(newState);
//     if (audioRef.current) audioRef.current.volume = newState ? 1.0 : 0.2;
//   };

//   const dialPadKeys = [
//     { key: 1, letters: '' }, { key: 2, letters: 'ABC' }, { key: 3, letters: 'DEF' },
//     { key: 4, letters: 'GHI' }, { key: 5, letters: 'JKL' }, { key: 6, letters: 'MNO' },
//     { key: 7, letters: 'PQRS' }, { key: 8, letters: 'TUV' }, { key: 9, letters: 'WXYZ' },
//     { key: '+', letters: '' }, { key: 0, letters: '' }, { key: '#', letters: '' }
//   ];

//   return (
//     <div className="fixed inset-0 w-full flex flex-col items-center select-none overflow-hidden"
//       style={{ background: "#020617", color: "white" }}>

//       <div className="w-full flex justify-between items-start px-6 py-4 shrink-0">
//         <div className="flex flex-col gap-2">
//           <button onClick={onLogout} className="bg-red-600/90 active:scale-95 p-2 px-3 rounded-xl text-[10px] font-black shadow-lg flex items-center gap-1 uppercase tracking-tighter">
//             <LogOut size={14} /> LOGOUT
//           </button>
//           <button onClick={() => navigate("/buy-card")} className="bg-green-600/90 active:scale-95 p-2 px-3 rounded-xl text-[10px] font-black shadow-lg flex items-center gap-1 uppercase tracking-tighter">
//             <CreditCard size={14} /> Buy Card
//           </button>
//         </div>
//         <div className="text-right text-yellow-500 font-black italic">
//           Habesha Tele
//           <p className="text-[10px] text-white opacity-50 font-mono">{phone || localStorage.getItem("userPhone")}</p>
//         </div>
//       </div>

//       <div className="text-center mb-1 shrink-0 cursor-pointer active:scale-95" onClick={fetchMinutesFromDB}>
//         <p className="text-[9px] uppercase tracking-widest opacity-60 mb-1 font-bold">Remaining Balance</p>
//         <p className={`text-5xl font-black ${secondsLeft < 60 ? "text-red-500 animate-pulse" : "text-yellow-400"}`}>
//           {formatToDisplay(secondsLeft)}
//         </p>
//       </div>

//       <div className="flex-1 w-full max-sm flex flex-col justify-between px-6 pb-2 min-h-0 overflow-hidden">
//         {activeTab === "keypad" ? (
//           <div className="flex flex-col h-full justify-evenly">
//             <div className="shrink-0 text-center relative">
//               <input 
//                 ref={inputRef}
//                 type="text"
//                 value={number}
//                 /* እቲ ከርሰር ብሩህ ብጫ ንኪኸውን */
//                 className="w-full bg-transparent text-white text-4xl font-light h-12 text-center outline-none italic tracking-widest caret-yellow-400"
//                 style={{ 
//                    caretWidth: '2px',
//                    /* ኣብ ገለ Browsers readOnly እንተኾይኑ ከርሰር ኣይርአን እዩ፡ ስለዚ focusable ንገብሮ */
//                 }}
//                 onChange={() => {}} // Warning ንምክልኻል
//               />
//               <div className="h-4 mt-1">
//                 {callStatus === 'ringing' && <p className="text-green-400 text-[9px] animate-pulse font-bold uppercase">Calling...</p>}
//                 {isAnswered && <p className="text-yellow-400 text-[9px] font-bold uppercase animate-bounce">In Call</p>}
//               </div>
//             </div>

//             <div className="grid grid-cols-3 gap-y-2 gap-x-4 max-w-[260px] mx-auto">
//               {dialPadKeys.map(({ key, letters }) => (
//                 <button key={key} onClick={() => handleKeyClick(key)} className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white/5 border border-white/10 flex flex-col items-center justify-center active:bg-white/20 active:scale-90 transition-all mx-auto">
//                   <span className="text-xl sm:text-2xl font-bold">{key}</span>
//                   <span className="text-[7px] opacity-40 uppercase">{letters}</span>
//                 </button>
//               ))}
//             </div>

//             <div className="flex justify-between items-center px-4 shrink-0">
//               <button onClick={toggleSpeaker} className={`p-4 rounded-full ${isSpeakerOn ? 'bg-yellow-400 text-black shadow-lg' : 'bg-white/5 border border-white/10'}`}>
//                 {isSpeakerOn ? <Volume2 size={22} /> : <VolumeX size={22} />}
//               </button>
//               <button className={`p-6 rounded-full shadow-xl ${isCalling ? 'bg-red-500 animate-pulse' : 'bg-green-500 active:scale-90'}`} onClick={isCalling ? handleHangUp : startCall}>
//                 {isCalling ? <PhoneOff size={28} fill="white" /> : <Phone size={28} fill="white" />}
//               </button>
//               <button className="p-4 rounded-full bg-white/5 border border-white/10 active:bg-red-500/10 active:text-red-400 transition-colors" onClick={handleDelete}>
//                 <Delete size={22} />
//               </button>
//             </div>
//           </div>
//         ) : (
//           <div className="flex flex-col h-full pt-2 pb-4">
//             <h2 className="text-base font-black text-yellow-500 uppercase tracking-widest border-b border-white/5 pb-2 mb-4">Call History</h2>
//             <div className="flex-1 overflow-y-auto space-y-2">
//               {callHistory.length === 0 ? <p className="text-center opacity-30 mt-20 text-xs italic">No call logs yet</p> :
//                 callHistory.map((log, i) => (
//                   <div key={i} className="bg-white/5 p-3 rounded-xl flex justify-between items-center border border-white/5">
//                     <div>
//                       <p className="font-bold text-sm text-yellow-50">{log.to}</p>
//                       <p className="text-[9px] opacity-40 uppercase">{log.date} • {log.time}</p>
//                     </div>
//                     <Phone size={14} className="text-green-400" />
//                   </div>
//                 ))}
//             </div>
//           </div>
//         )}
//       </div>

//       <div className="w-full bg-black/90 backdrop-blur-xl border-t border-white/10 flex justify-around items-center py-3 shrink-0">
//         <button onClick={() => setActiveTab("history")} className={`flex flex-col items-center gap-1 flex-1 py-1 transition-colors ${activeTab === "history" ? "text-yellow-400" : "text-white/20"}`}>
//           <Clock size={20} /> <span className="text-[9px] font-black uppercase tracking-widest">History</span>
//         </button>
//         <button onClick={() => setActiveTab("keypad")} className={`flex flex-col items-center gap-1 flex-1 py-1 transition-colors ${activeTab === "keypad" ? "text-yellow-400" : "text-white/20"}`}>
//           <Grid size={20} /> <span className="text-[9px] font-black uppercase tracking-widest">Keypad</span>
//         </button>
//       </div>
//     </div>
//   );
// }

// export default Home;


// import { useState, useEffect, useRef } from "react";
// import axios from "axios";
// import { Phone, PhoneOff, Delete, Volume2, VolumeX, LogOut, Clock, Grid, CreditCard } from "lucide-react";
// import { useNavigate, useLocation } from "react-router-dom"; 

// function Home({ phone, onLogout }) {
//   const navigate = useNavigate();
//   const location = useLocation(); 
//   const [number, setNumber] = useState("");
//   const [isCalling, setIsCalling] = useState(false);
//   const [isAnswered, setIsAnswered] = useState(false);
//   const [secondsLeft, setSecondsLeft] = useState(0);
//   const [callStatus, setCallStatus] = useState(null);
//   const [isSpeakerOn, setIsSpeakerOn] = useState(false);
//   const [activeTab, setActiveTab] = useState("keypad");

//   const inputRef = useRef(null);

//   const [callHistory, setCallHistory] = useState(() => {
//     const saved = localStorage.getItem("callHistory");
//     return saved ? JSON.parse(saved) : [];
//   });

//   const parseToSeconds = (timeStr) => {
//     if (!timeStr || typeof timeStr !== 'string' || !timeStr.includes(':')) return 0;
//     const [m, s] = timeStr.split(':').map(val => parseInt(val) || 0);
//     return (m * 60) + s;
//   };

//   const audioRef = useRef(new Audio("/sounds/ringings.mp3"));
//   const beepRef = useRef(new Audio("/sounds/dialing.mp3"));
//   const warningVoice = useRef(new Audio("/sounds/dialings.mp3"));

//   useEffect(() => {
//     localStorage.setItem("callHistory", JSON.stringify(callHistory));
//   }, [callHistory]);

//   const formatToDisplay = (totalSeconds) => {
//     const mins = Math.floor(totalSeconds / 60);
//     const secs = totalSeconds % 60;
//     return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
//   };

//   const fetchMinutesFromDB = async () => {
//     let userPhone = phone || location.state?.userPhone || localStorage.getItem("userPhone");
//     if (!userPhone || userPhone === "No Phone") return;
//     if (!userPhone.startsWith('+')) { userPhone = `+${userPhone}`; }

//     try {
//       const response = await axios.get(`http://localhost:5000/api/auth/user-minutes?phone=${encodeURIComponent(userPhone)}`);
//       if (response.data.success) {
//         setSecondsLeft(parseToSeconds(response.data.minutes));
//         localStorage.setItem("userPhone", userPhone);
//       }
//     } catch (error) { console.error("Fetch Error", error); }
//   };
  
//   const syncMinutesWithDB = async (currentSeconds) => {
//     const userPhone = phone || location.state?.userPhone || localStorage.getItem("userPhone");
//     if (!userPhone) return;
//     try {
//       await axios.put('http://localhost:5000/api/auth/update-minutes', {
//         phone: userPhone,
//         remainingMinutes: formatToDisplay(currentSeconds)
//       });
//     } catch (err) { console.error("❌ DB Update Error"); }
//   };

//   useEffect(() => {
//     fetchMinutesFromDB(); 
//     window.addEventListener("focus", fetchMinutesFromDB);
//     return () => window.removeEventListener("focus", fetchMinutesFromDB);
//   }, [phone, location.state?.refresh]);

//   useEffect(() => {
//     let timerInterval;
//     if (isCalling && isAnswered && secondsLeft > 0) {
//       timerInterval = setInterval(() => {
//         setSecondsLeft(prev => {
//           const nextValue = prev - 1;
//           if (nextValue <= 0) { handleHangUp(); return 0; }
//           if (nextValue % 10 === 0) { syncMinutesWithDB(nextValue); }
//           if (nextValue === 60) warningVoice.current.play();
//           return nextValue;
//         });
//       }, 1000);
//     }
//     return () => clearInterval(timerInterval);
//   }, [isCalling, isAnswered]);

//   const handleHangUp = async () => {
//     await syncMinutesWithDB(secondsLeft); 
//     if (number || callStatus) {
//       setCallHistory(prev => [{
//         to: number || "Unknown",
//         time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
//         date: new Date().toLocaleDateString(),
//         status: isAnswered ? "Answered" : "Missed"
//       }, ...prev]);
//     }
//     setIsCalling(false);
//     setIsAnswered(false);
//     setCallStatus(null);
//     setNumber(""); // *** ቁጽሪ ይጠፍእ (Reset) ***
//     audioRef.current.pause();
//     audioRef.current.currentTime = 0;
//   };

//  const startCall = (customNumber = null) => {
//     // 1. ቁጽሪ ወይ String ምዃኑ ንረጋግጽ (TypeError ንምክልኻል)
//     const targetNumber = String(customNumber || number || ""); 

//     // 2. ቁጽሪ ትኽክል እንተኾይኑ ንፍትሽ
//     if (!targetNumber || targetNumber.trim().length < 10) {
//       return alert("Enter a valid number!");
//     }

//     if (secondsLeft <= 0) return alert("No minutes left! Please buy a card.");
    
//     setIsCalling(true); 
//     setCallStatus('ringing');
//     setIsAnswered(false);
    
//     audioRef.current.loop = true;
//     audioRef.current.play().catch(() => { });

//     // --- AUTOMATIC ANSWER (TEST MODE) ---
//     // ነዚ ሎጂክ ምስ ደለኻዮ ጥራሕ ክትጥቀመሉ ትኽእል ኢኻ (Uncomment it for testing)
    
//     setTimeout(() => { 
//         setIsAnswered(true); 
//         setCallStatus('connected'); 
//         audioRef.current.pause();
//     }, 4000);
    
//   };
//   const handleKeyClick = (val) => {
//     if (beepRef.current) { beepRef.current.currentTime = 0; beepRef.current.play().catch(() => { }); }
    
//     const input = inputRef.current;
//     if (!input) {
//         setNumber(prev => prev + val);
//         return;
//     }
//     const start = input.selectionStart;
//     const end = input.selectionEnd;
//     const newNumber = number.substring(0, start) + val + number.substring(end);
    
//     setNumber(newNumber);

//     setTimeout(() => {
//       input.focus();
//       input.setSelectionRange(start + 1, start + 1);
//     }, 0);
//   };

//   const handleDelete = () => {
//     const input = inputRef.current;
//     if (!input) {
//         setNumber(prev => prev.slice(0, -1));
//         return;
//     }
//     const start = input.selectionStart;
//     const end = input.selectionEnd;

//     if (start === end && start > 0) {
//       const newNumber = number.substring(0, start - 1) + number.substring(end);
//       setNumber(newNumber);
//       setTimeout(() => {
//         input.focus();
//         input.setSelectionRange(start - 1, start - 1);
//       }, 0);
//     } else if (start !== end) {
//       const newNumber = number.substring(0, start) + number.substring(end);
//       setNumber(newNumber);
//       setTimeout(() => {
//         input.focus();
//         input.setSelectionRange(start, start);
//       }, 0);
//     }
//   };

//   const toggleSpeaker = () => {
//     const newState = !isSpeakerOn;
//     setIsSpeakerOn(newState);
//     if (audioRef.current) audioRef.current.volume = newState ? 1.0 : 0.2;
//   };

//   const dialPadKeys = [
//     { key: 1, letters: '' }, { key: 2, letters: 'ABC' }, { key: 3, letters: 'DEF' },
//     { key: 4, letters: 'GHI' }, { key: 5, letters: 'JKL' }, { key: 6, letters: 'MNO' },
//     { key: 7, letters: 'PQRS' }, { key: 8, letters: 'TUV' }, { key: 9, letters: 'WXYZ' },
//     { key: '+', letters: '' }, { key: 0, letters: '' }, { key: '#', letters: '' }
//   ];

//   return (
//     <div className="fixed inset-0 w-full flex flex-col items-center select-none overflow-hidden"
//       style={{ background: "#020617", color: "white" }}>

//       {/* Top Section - Balance */}
//       <div className="w-full flex justify-between items-start px-6 py-4 shrink-0">
//         <div className="flex flex-col gap-2">
//           <button onClick={onLogout} className="bg-red-600/90 active:scale-95 p-2 px-3 rounded-xl text-[10px] font-black shadow-lg flex items-center gap-1 uppercase tracking-tighter">
//             <LogOut size={14} /> LOGOUT
//           </button>
//           <button onClick={() => navigate("/buy-card")} className="bg-green-600/90 active:scale-95 p-2 px-3 rounded-xl text-[10px] font-black shadow-lg flex items-center gap-1 uppercase tracking-tighter">
//             <CreditCard size={14} /> Buy Card
//           </button>
//         </div>
//         <div className="text-right text-yellow-500 font-black italic">
//           Habesha Tele
//           <p className="text-[10px] text-white opacity-50 font-mono">{phone || localStorage.getItem("userPhone")}</p>
//         </div>
//       </div>

//       <div className="text-center mb-1 shrink-0 cursor-pointer active:scale-95" onClick={fetchMinutesFromDB}>
//         <p className="text-[9px] uppercase tracking-widest opacity-60 mb-1 font-bold">Remaining Balance</p>
//         <p className={`text-5xl font-black ${secondsLeft < 60 ? "text-red-500 animate-pulse" : "text-yellow-400"}`}>
//           {formatToDisplay(secondsLeft)}
//         </p>
//       </div>

//       <div className="flex-1 w-full max-sm flex flex-col justify-between px-6 pb-2 min-h-0 overflow-hidden">
//         {activeTab === "keypad" ? (
//           <div className="flex flex-col h-full justify-evenly">
            
//             {/* Screen Area - Calling ምስ ኾነ ቁጽሪ ጠፊኡ "Calling" ይርአ */}
//             <div className="shrink-0 text-center relative h-16 flex items-center justify-center">
//               {isCalling ? (
//                 <div className="flex flex-col items-center animate-pulse">
//                   <p className="text-green-400 text-2xl font-black uppercase tracking-[0.2em]">Calling...</p>
//                   <p className="text-white/40 text-xs mt-1 italic tracking-widest">{number}</p>
//                 </div>
//               ) : (
//                 <input 
//                   ref={inputRef}
//                   type="text"
//                   value={number}
//                   className="w-full bg-transparent text-white text-4xl font-light h-12 text-center outline-none italic tracking-widest caret-yellow-400"
//                   style={{ caretWidth: '2px' }}
//                   onChange={() => {}}
//                 />
//               )}
//             </div>

//             {/* Dial Pad - Calling ምስ ኾነ ዳባዝ ይኸውን (Opacity-10) */}
//             <div className={`grid grid-cols-3 gap-y-2 gap-x-4 max-w-[260px] mx-auto transition-opacity duration-300 ${isCalling ? 'opacity-10 pointer-events-none' : 'opacity-100'}`}>
//               {dialPadKeys.map(({ key, letters }) => (
//                 <button key={key} onClick={() => handleKeyClick(key)} className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white/5 border border-white/10 flex flex-col items-center justify-center active:bg-white/20 active:scale-90 transition-all mx-auto">
//                   <span className="text-xl sm:text-2xl font-bold">{key}</span>
//                   <span className="text-[7px] opacity-40 uppercase">{letters}</span>
//                 </button>
//               ))}
//             </div>

//             {/* Controls */}
//             <div className="flex justify-between items-center px-4 shrink-0">
//               <button onClick={toggleSpeaker} className={`p-4 rounded-full ${isSpeakerOn ? 'bg-yellow-400 text-black shadow-lg' : 'bg-white/5 border border-white/10'}`}>
//                 {isSpeakerOn ? <Volume2 size={22} /> : <VolumeX size={22} />}
//               </button>
              
//               {/* እታ ቀንዲ ትቕየር Button: isCalling ምስ ኾነ ቀያሕ ትኸውን */}
//               <button 
//                 className={`p-6 rounded-full shadow-xl transition-all duration-300 ${isCalling ? 'bg-red-600 scale-110 shadow-red-500/20' : 'bg-green-500 active:scale-90 shadow-green-500/20'}`} 
//                 onClick={isCalling ? handleHangUp : startCall}
//               >
//                 {isCalling ? <PhoneOff size={28} fill="white" /> : <Phone size={28} fill="white" />}
//               </button>

//               <button className={`p-4 rounded-full bg-white/5 border border-white/10 active:bg-red-500/10 active:text-red-400 transition-colors ${isCalling ? 'opacity-0 pointer-events-none' : 'opacity-100'}`} onClick={handleDelete}>
//                 <Delete size={22} />
//               </button>
//             </div>
//           </div>
//         ) : (
//           <div className="flex flex-col h-full pt-2 pb-4 overflow-hidden">
//              <h2 className="text-base font-black text-yellow-500 uppercase tracking-widest border-b border-white/5 pb-2 mb-4">Call History</h2>
//              <div className="flex-1 overflow-y-auto space-y-2">
//               {callHistory.length === 0 ? <p className="text-center opacity-30 mt-20 text-xs italic">No call logs yet</p> :
//                 callHistory.map((log, i) => (
//                   <div key={i} className="bg-white/5 p-3 rounded-xl flex justify-between items-center border border-white/5">
//                     <div>
//                       <p className="font-bold text-sm text-yellow-50">{log.to}</p>
//                       <p className="text-[9px] opacity-40 uppercase">{log.date} • {log.time}</p>
//                     </div>
//                     <Phone size={14} className="text-green-400" />
//                   </div>
//                 ))}
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Tabs */}
//       <div className="w-full bg-black/90 backdrop-blur-xl border-t border-white/10 flex justify-around items-center py-3 shrink-0">
//         <button onClick={() => setActiveTab("history")} className={`flex flex-col items-center gap-1 flex-1 py-1 transition-colors ${activeTab === "history" ? "text-yellow-400" : "text-white/20"}`}>
//           <Clock size={20} /> <span className="text-[9px] font-black uppercase tracking-widest">History</span>
//         </button>
//         <button onClick={() => setActiveTab("keypad")} className={`flex flex-col items-center gap-1 flex-1 py-1 transition-colors ${activeTab === "keypad" ? "text-yellow-400" : "text-white/20"}`}>
//           <Grid size={20} /> <span className="text-[9px] font-black uppercase tracking-widest">Keypad</span>
//         </button>
//       </div>
//     </div>
//   );
// }

// export default Home;


// import { useState, useEffect, useRef } from "react";
// import axios from "axios";
// import { Phone, PhoneOff, Delete, Volume2, VolumeX, LogOut, Clock, Grid, CreditCard } from "lucide-react";
// import { useNavigate, useLocation } from "react-router-dom"; 

// function Home({ phone, onLogout }) {
//   const navigate = useNavigate();
//   const location = useLocation(); 
//   const [number, setNumber] = useState("");
//   const [isCalling, setIsCalling] = useState(false);
//   const [isAnswered, setIsAnswered] = useState(false);
//   const [secondsLeft, setSecondsLeft] = useState(0);
//   const [callStatus, setCallStatus] = useState(null);
//   const [isSpeakerOn, setIsSpeakerOn] = useState(false);
//   const [activeTab, setActiveTab] = useState("keypad");

//   const inputRef = useRef(null);

//   const [callHistory, setCallHistory] = useState(() => {
//     const saved = localStorage.getItem("callHistory");
//     return saved ? JSON.parse(saved) : [];
//   });

//   const parseToSeconds = (timeStr) => {
//     if (!timeStr || typeof timeStr !== 'string' || !timeStr.includes(':')) return 0;
//     const [m, s] = timeStr.split(':').map(val => parseInt(val) || 0);
//     return (m * 60) + s;
//   };

//   const audioRef = useRef(new Audio("/sounds/ringings.mp3"));
//   const beepRef = useRef(new Audio("/sounds/dialing.mp3"));
//   const warningVoice = useRef(new Audio("/sounds/dialings.mp3"));

//   useEffect(() => {
//     localStorage.setItem("callHistory", JSON.stringify(callHistory));
//   }, [callHistory]);

//   const formatToDisplay = (totalSeconds) => {
//     const mins = Math.floor(totalSeconds / 60);
//     const secs = totalSeconds % 60;
//     return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
//   };

//   const fetchMinutesFromDB = async () => {
//     let userPhone = phone || location.state?.userPhone || localStorage.getItem("userPhone");
//     if (!userPhone || userPhone === "No Phone") return;
//     if (!userPhone.startsWith('+')) { userPhone = `+${userPhone}`; }

//     try {
//       const response = await axios.get(`http://localhost:5000/api/auth/user-minutes?phone=${encodeURIComponent(userPhone)}`);
//       if (response.data.success) {
//         setSecondsLeft(parseToSeconds(response.data.minutes));
//         localStorage.setItem("userPhone", userPhone);
//       }
//     } catch (error) { console.error("Fetch Error", error); }
//   };
  
//   // *** ኣገዳሲት መፍትሒ: Database ቀልጢፉ ንኪመሓላለፍ ***
//   const syncMinutesWithDB = async (currentSeconds) => {
//     const userPhone = phone || localStorage.getItem("userPhone");
//     if (!userPhone) return;
//     try {
//       await axios.put('http://localhost:5000/api/auth/update-minutes', {
//         phone: userPhone,
//         remainingMinutes: formatToDisplay(currentSeconds)
//       });
//     } catch (err) { console.error("❌ DB Update Error", err); }
//   };

//   useEffect(() => {
//     fetchMinutesFromDB(); 
//     window.addEventListener("focus", fetchMinutesFromDB);
//     return () => window.removeEventListener("focus", fetchMinutesFromDB);
//   }, [phone, location.state?.refresh]);

//   // --- Real-time Timer Logic ---
//   useEffect(() => {
//     let timerInterval;
//     if (isCalling && isAnswered && secondsLeft > 0) {
//       timerInterval = setInterval(() => {
//         setSecondsLeft(prev => {
//           const nextValue = prev - 1;
          
//           if (nextValue <= 0) {
//             handleHangUp(); // ደቂቕ ምስ ተወድአ ባዕሉ ይዓጽዎ
//             return 0;
//           }

//           // በብ 5 ሰከንድ ምስ DB ይሰማማዕ (sync)
//           if (nextValue % 5 === 0) {
//             syncMinutesWithDB(nextValue);
//           }
          
//           if (nextValue === 60) warningVoice.current.play();
//           return nextValue;
//         });
//       }, 1000);
//     }
//     return () => clearInterval(timerInterval);
//   }, [isCalling, isAnswered]);

//   const handleHangUp = async () => {
//     // 1. መጀመሪያ ነቲ ናይ መወዳእታ ዝተረፈ ደቂቕ ቀልጢፍካ ናብ DB ስደዶ
//     await syncMinutesWithDB(secondsLeft); 
    
//     if (number || callStatus) {
//       setCallHistory(prev => [{
//         to: number || "Unknown",
//         time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
//         date: new Date().toLocaleDateString(),
//         status: isAnswered ? "Answered" : "Missed"
//       }, ...prev]);
//     }
    
//     setIsCalling(false);
//     setIsAnswered(false);
//     setCallStatus(null);
//     setNumber(""); 
//     audioRef.current.pause();
//     audioRef.current.currentTime = 0;
//   };


//   const startCall = (customNumber = null) => {
//     const targetNumber = String(customNumber || number || ""); 
//     if (!targetNumber || targetNumber.trim().length < 10) return alert("Enter a valid number!");
//     if (secondsLeft <= 0) return alert("No minutes left!");

//     setIsCalling(true);
//     setCallStatus('ringing');
//     setIsAnswered(false);
//     audioRef.current.play();

//     // --- ናይ በሓቂ ሎጂክ (Logic) ---
//     // 1. ኣብዚ ናብ Backend (VoIP API) ትእዛዝ ትሰድድ
//     // axios.post('/api/make-call', { to: targetNumber });

//     // 2. Timeout Logic: እቲ ሰብ ን 45 ሰከንድ እንተዘይኣልዒሉዎ ባዕሉ ይዓጽዎ
//     const callTimeout = setTimeout(() => {
//       if (!isAnswered) { // ክሳብ ሕጂ እንተዘይተመሊሱ
//         console.log("No answer, hanging up...");
//         handleHangUp(); // ባዕሉ ይዓጽዎ እሞ ናብ መጽሓፊ ቁጽሪ ይምለስ
//         alert("The person is not answering. Please try again.");
//       }
//     }, 45000); // 45 ሰከንድ ተጸበ

//     // 3. Socket.io Listen (ካብ Backend "Answered" ዝብል መልእኽቲ ምስ መጸ)
//     /* 
//     socket.on('call-answered', () => {
//       clearTimeout(callTimeout); // ነቲ Timeout ኣጥፍኣዮ
//       setIsAnswered(true);
//       setCallStatus('connected');
//       audioRef.current.pause(); // እቲ Ringing ድምጺ ኣጥፍኣዮ
//     });

//     socket.on('call-failed', () => {
//       handleHangUp();
//       alert("Call failed or invalid number.");
//     });
//     */
//     // --- AUTOMATIC ANSWER (TEST MODE) ---
//     setTimeout(() => { 
//         setIsAnswered(true); 
//         setCallStatus('connected'); 
//         audioRef.current.pause();
//     }, 3000);
//   };

//   const handleKeyClick = (val) => {
//     if (beepRef.current) { beepRef.current.currentTime = 0; beepRef.current.play().catch(() => { }); }
//     const input = inputRef.current;
//     if (!input) {
//         setNumber(prev => prev + val);
//         return;
//     }
//     const start = input.selectionStart;
//     const end = input.selectionEnd;
//     const newNumber = number.substring(0, start) + val + number.substring(end);
//     setNumber(newNumber);
//     setTimeout(() => {
//       input.focus();
//       input.setSelectionRange(start + 1, start + 1);
//     }, 0);
//   };

//   const handleDelete = () => {
//     const input = inputRef.current;
//     if (!input) {
//         setNumber(prev => prev.slice(0, -1));
//         return;
//     }
//     const start = input.selectionStart;
//     const end = input.selectionEnd;

//     if (start === end && start > 0) {
//       const newNumber = number.substring(0, start - 1) + number.substring(end);
//       setNumber(newNumber);
//       setTimeout(() => {
//         input.focus();
//         input.setSelectionRange(start - 1, start - 1);
//       }, 0);
//     } else if (start !== end) {
//       const newNumber = number.substring(0, start) + number.substring(end);
//       setNumber(newNumber);
//       setTimeout(() => {
//         input.focus();
//         input.setSelectionRange(start, start);
//       }, 0);
//     }
//   };

//   const toggleSpeaker = () => {
//     const newState = !isSpeakerOn;
//     setIsSpeakerOn(newState);
//     if (audioRef.current) audioRef.current.volume = newState ? 1.0 : 0.2;
//   };

//   const dialPadKeys = [
//     { key: 1, letters: '' }, { key: 2, letters: 'ABC' }, { key: 3, letters: 'DEF' },
//     { key: 4, letters: 'GHI' }, { key: 5, letters: 'JKL' }, { key: 6, letters: 'MNO' },
//     { key: 7, letters: 'PQRS' }, { key: 8, letters: 'TUV' }, { key: 9, letters: 'WXYZ' },
//     { key: '+', letters: '' }, { key: 0, letters: '' }, { key: '#', letters: '' }
//   ];

//   return (
//     <div className="fixed inset-0 w-full flex flex-col items-center select-none overflow-hidden"
//       style={{ background: "#020617", color: "white" }}>

//       <div className="w-full flex justify-between items-start px-6 py-4 shrink-0">
//         <div className="flex flex-col gap-2">
//           <button onClick={onLogout} className="bg-red-600/90 active:scale-95 p-2 px-3 rounded-xl text-[10px] font-black shadow-lg flex items-center gap-1 uppercase tracking-tighter">
//             <LogOut size={14} /> LOGOUT
//           </button>
//           <button onClick={() => navigate("/buy-card")} className="bg-green-600/90 active:scale-95 p-2 px-3 rounded-xl text-[10px] font-black shadow-lg flex items-center gap-1 uppercase tracking-tighter">
//             <CreditCard size={14} /> Buy Card
//           </button>
//         </div>
//         <div className="text-right text-yellow-500 font-black italic">
//           Habesha Tele
//           <p className="text-[10px] text-white opacity-50 font-mono">{phone || localStorage.getItem("userPhone")}</p>
//         </div>
//       </div>

//       <div className="text-center mb-1 shrink-0 cursor-pointer active:scale-95" onClick={fetchMinutesFromDB}>
//         <p className="text-[9px] uppercase tracking-widest opacity-60 mb-1 font-bold">Remaining Balance</p>
//         <p className={`text-5xl font-black ${secondsLeft < 60 ? "text-red-500 animate-pulse" : "text-yellow-400"}`}>
//           {formatToDisplay(secondsLeft)}
//         </p>
//       </div>

//       <div className="flex-1 w-full max-sm flex flex-col justify-between px-6 pb-2 min-h-0 overflow-hidden">
//         {activeTab === "keypad" ? (
//           <div className="flex flex-col h-full justify-evenly">
            
//             <div className="shrink-0 text-center relative h-16 flex items-center justify-center">
//               {isCalling ? (
//                 <div className="flex flex-col items-center animate-pulse">
//                   <p className="text-green-400 text-2xl font-black uppercase tracking-[0.2em]">Calling...</p>
//                   <p className="text-white/40 text-xs mt-1 italic tracking-widest">{number}</p>
//                 </div>
//               ) : (
//                 <input 
//                   ref={inputRef}
//                   type="text"
//                   value={number}
//                   className="w-full bg-transparent text-white text-4xl font-light h-12 text-center outline-none italic tracking-widest caret-yellow-400"
//                   style={{ caretWidth: '2px' }}
//                   onChange={() => {}}
//                 />
//               )}
//             </div>

//             <div className={`grid grid-cols-3 gap-y-2 gap-x-4 max-w-[260px] mx-auto transition-opacity duration-300 ${isCalling ? 'opacity-10 pointer-events-none' : 'opacity-100'}`}>
//               {dialPadKeys.map(({ key, letters }) => (
//                 <button key={key} onClick={() => handleKeyClick(key)} className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white/5 border border-white/10 flex flex-col items-center justify-center active:bg-white/20 active:scale-90 transition-all mx-auto">
//                   <span className="text-xl sm:text-2xl font-bold">{key}</span>
//                   <span className="text-[7px] opacity-40 uppercase">{letters}</span>
//                 </button>
//               ))}
//             </div>

//             <div className="flex justify-between items-center px-4 shrink-0">
//               <button onClick={toggleSpeaker} className={`p-4 rounded-full ${isSpeakerOn ? 'bg-yellow-400 text-black shadow-lg' : 'bg-white/5 border border-white/10'}`}>
//                 {isSpeakerOn ? <Volume2 size={22} /> : <VolumeX size={22} />}
//               </button>
              
//               <button 
//                 className={`p-6 rounded-full shadow-xl transition-all duration-300 ${isCalling ? 'bg-red-600 scale-110 shadow-red-500/20' : 'bg-green-500 active:scale-90 shadow-green-500/20'}`} 
//                 onClick={isCalling ? handleHangUp : startCall}
//               >
//                 {isCalling ? <PhoneOff size={28} fill="white" /> : <Phone size={28} fill="white" />}
//               </button>

//               <button className={`p-4 rounded-full bg-white/5 border border-white/10 active:bg-red-500/10 active:text-red-400 transition-colors ${isCalling ? 'opacity-0 pointer-events-none' : 'opacity-100'}`} onClick={handleDelete}>
//                 <Delete size={22} />
//               </button>
//             </div>
//           </div>
//         ) : (
//           <div className="flex flex-col h-full pt-2 pb-4 overflow-hidden">
//              <h2 className="text-base font-black text-yellow-500 uppercase tracking-widest border-b border-white/5 pb-2 mb-4">Call History</h2>
//              <div className="flex-1 overflow-y-auto space-y-2">
//               {callHistory.length === 0 ? <p className="text-center opacity-30 mt-20 text-xs italic">No call logs yet</p> :
//                 callHistory.map((log, i) => (
//                   <div key={i} className="bg-white/5 p-3 rounded-xl flex justify-between items-center border border-white/5">
//                     <div>
//                       <p className="font-bold text-sm text-yellow-50">{log.to}</p>
//                       <p className="text-[9px] opacity-40 uppercase">{log.date} • {log.time}</p>
//                     </div>
//                     <Phone size={14} className="text-green-400" />
//                   </div>
//                 ))}
//             </div>
//           </div>
//         )}
//       </div>

//       <div className="w-full bg-black/90 backdrop-blur-xl border-t border-white/10 flex justify-around items-center py-3 shrink-0">
//         <button onClick={() => setActiveTab("history")} className={`flex flex-col items-center gap-1 flex-1 py-1 transition-colors ${activeTab === "history" ? "text-yellow-400" : "text-white/20"}`}>
//           <Clock size={20} /> <span className="text-[9px] font-black uppercase tracking-widest">History</span>
//         </button>
//         <button onClick={() => setActiveTab("keypad")} className={`flex flex-col items-center gap-1 flex-1 py-1 transition-colors ${activeTab === "keypad" ? "text-yellow-400" : "text-white/20"}`}>
//           <Grid size={20} /> <span className="text-[9px] font-black uppercase tracking-widest">Keypad</span>
//         </button>
//       </div>
//     </div>
//   );
// }

// export default Home;


// import { useState, useEffect, useRef } from "react";
// import axios from "axios";
// import { Phone, PhoneOff, Delete, Volume2, VolumeX, LogOut, Clock, Grid, CreditCard } from "lucide-react";

// import { useNavigate, useLocation } from "react-router-dom"; 

// function Home({ phone, onLogout }) {
//   const navigate = useNavigate();
//   const location = useLocation(); 
//   const [number, setNumber] = useState("");
//   const [isCalling, setIsCalling] = useState(false);
//   const [isAnswered, setIsAnswered] = useState(false);
//   const [secondsLeft, setSecondsLeft] = useState(0);
//   const [callStatus, setCallStatus] = useState(null);
//   const [isSpeakerOn, setIsSpeakerOn] = useState(false);
//   const [activeTab, setActiveTab] = useState("keypad");

//   const inputRef = useRef(null);

//   const [callHistory, setCallHistory] = useState(() => {
//     const saved = localStorage.getItem("callHistory");
//     return saved ? JSON.parse(saved) : [];
//   });

//   const parseToSeconds = (timeStr) => {
//     if (!timeStr || typeof timeStr !== 'string' || !timeStr.includes(':')) return 0;
//     const [m, s] = timeStr.split(':').map(val => parseInt(val) || 0);
//     return (m * 60) + s;
//   };

//   const audioRef = useRef(new Audio("/sounds/ringings.mp3"));
//   const beepRef = useRef(new Audio("/sounds/dialing.mp3"));
//   const warningVoice = useRef(new Audio("/sounds/dialings.mp3"));

//   useEffect(() => {
//     localStorage.setItem("callHistory", JSON.stringify(callHistory));
//   }, [callHistory]);

//   const formatToDisplay = (totalSeconds) => {
//     const mins = Math.floor(totalSeconds / 60);
//     const secs = totalSeconds % 60;
//     return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
//   };

//   const fetchMinutesFromDB = async () => {
//     let userPhone = phone || location.state?.userPhone || localStorage.getItem("userPhone");
//     if (!userPhone || userPhone === "No Phone") return;
//     if (!userPhone.startsWith('+')) { userPhone = `+${userPhone}`; }

//     try {
//       const response = await axios.get(`http://localhost:5000/api/auth/user-minutes?phone=${encodeURIComponent(userPhone)}`);
//       if (response.data.success) {
//         setSecondsLeft(parseToSeconds(response.data.minutes));
//         localStorage.setItem("userPhone", userPhone);
//       }
//     } catch (error) { console.error("Fetch Error", error); }
//   };
  
//   const syncMinutesWithDB = async (currentSeconds) => {
//     const userPhone = phone || localStorage.getItem("userPhone");
//     if (!userPhone) return;
//     try {
//       await axios.put('http://localhost:5000/api/auth/update-minutes', {
//         phone: userPhone,
//         remainingMinutes: formatToDisplay(currentSeconds)
//       });
//     } catch (err) { console.error("❌ DB Update Error", err); }
//   };

//   useEffect(() => {
//     fetchMinutesFromDB(); 
//     window.addEventListener("focus", fetchMinutesFromDB);
//     return () => window.removeEventListener("focus", fetchMinutesFromDB);
//   }, [phone, location.state?.refresh]);

//   useEffect(() => {
//     let timerInterval;
//     if (isCalling && isAnswered && secondsLeft > 0) {
//       timerInterval = setInterval(() => {
//         setSecondsLeft(prev => {
//           const nextValue = prev - 1;
//           if (nextValue <= 0) { handleHangUp(); return 0; }
//           if (nextValue % 5 === 0) { syncMinutesWithDB(nextValue); }
//           if (nextValue === 60) warningVoice.current.play();
//           return nextValue;
//         });
//       }, 1000);
//     }
//     return () => clearInterval(timerInterval);
//   }, [isCalling, isAnswered]);

//   const handleHangUp = async () => {
//     await syncMinutesWithDB(secondsLeft); 
//     if (number || callStatus) {
//       setCallHistory(prev => [{
//         to: number || "Unknown",
//         time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
//         date: new Date().toLocaleDateString(),
//         status: isAnswered ? "Answered" : "Missed"
//       }, ...prev]);
//     }
//     setIsCalling(false);
//     setIsAnswered(false);
//     setCallStatus(null);
//     setNumber(""); 
//     audioRef.current.pause();
//     audioRef.current.currentTime = 0;
//   };

//   const startCall = (customNumber = null) => {
//     const targetNumber = String(customNumber || number || ""); 
//     if (!targetNumber || targetNumber.trim().length < 10) return alert("Enter a valid number!");
//     if (secondsLeft <= 0) return alert("No minutes left!");

//     setIsCalling(true);
//     setCallStatus('ringing');
//     setIsAnswered(false);
//     audioRef.current.play();

//     // --- AUTOMATIC ANSWER (TEST MODE) ---
//     setTimeout(() => { 
//         setIsAnswered(true); 
//         setCallStatus('connected'); 
//         audioRef.current.pause();
//     }, 3000);
//   };

//   const handleKeyClick = (val) => {
//     if (beepRef.current) { beepRef.current.currentTime = 0; beepRef.current.play().catch(() => { }); }
//     const input = inputRef.current;
//     if (!input) {
//         setNumber(prev => prev + val);
//         return;
//     }
//     const start = input.selectionStart;
//     const end = input.selectionEnd;
//     const newNumber = number.substring(0, start) + val + number.substring(end);
//     setNumber(newNumber);
//     setTimeout(() => {
//       input.focus();
//       input.setSelectionRange(start + 1, start + 1);
//     }, 0);
//   };

//   const handleDelete = () => {
//     const input = inputRef.current;
//     if (!input) {
//         setNumber(prev => prev.slice(0, -1));
//         return;
//     }
//     const start = input.selectionStart;
//     const end = input.selectionEnd;
//     if (start === end && start > 0) {
//       const newNumber = number.substring(0, start - 1) + number.substring(end);
//       setNumber(newNumber);
//       setTimeout(() => {
//         input.focus();
//         input.setSelectionRange(start - 1, start - 1);
//       }, 0);
//     } else if (start !== end) {
//       const newNumber = number.substring(0, start) + number.substring(end);
//       setNumber(newNumber);
//       setTimeout(() => {
//         input.focus();
//         input.setSelectionRange(start, start);
//       }, 0);
//     }
//   };

//   const toggleSpeaker = () => {
//     const newState = !isSpeakerOn;
//     setIsSpeakerOn(newState);
//     if (audioRef.current) audioRef.current.volume = newState ? 1.0 : 0.2;
//   };

//   const dialPadKeys = [
//     { key: 1, letters: '' }, { key: 2, letters: 'ABC' }, { key: 3, letters: 'DEF' },
//     { key: 4, letters: 'GHI' }, { key: 5, letters: 'JKL' }, { key: 6, letters: 'MNO' },
//     { key: 7, letters: 'PQRS' }, { key: 8, letters: 'TUV' }, { key: 9, letters: 'WXYZ' },
//     { key: '+', letters: '' }, { key: 0, letters: '' }, { key: '#', letters: '' }
//   ];

//   return (
//     <div className="fixed inset-0 w-full flex flex-col items-center select-none overflow-hidden"
//       style={{ background: "#020617", color: "white" }}>

//       <div className="w-full flex justify-between items-start px-6 py-4 shrink-0">
//         <div className="flex flex-col gap-2">
//           <button onClick={onLogout} className="bg-red-600/90 active:scale-95 p-2 px-3 rounded-xl text-[10px] font-black shadow-lg flex items-center gap-1 uppercase tracking-tighter">
//             <LogOut size={14} /> LOGOUT
//           </button>
//           <button onClick={() => navigate("/buy-card")} className="bg-green-600/90 active:scale-95 p-2 px-3 rounded-xl text-[10px] font-black shadow-lg flex items-center gap-1 uppercase tracking-tighter">
//             <CreditCard size={14} /> Buy Card
//           </button>
//         </div>
//         <div className="text-right text-yellow-500 font-black italic">
//           Habesha Tele
//           <p className="text-[10px] text-white opacity-50 font-mono">{phone || localStorage.getItem("userPhone")}</p>
//         </div>
//       </div>

//       <div className="text-center mb-1 shrink-0 cursor-pointer active:scale-95" onClick={fetchMinutesFromDB}>
//         <p className="text-[9px] uppercase tracking-widest opacity-60 mb-1 font-bold">Remaining Balance</p>
//         <p className={`text-5xl font-black ${secondsLeft < 60 ? "text-red-500 animate-pulse" : "text-yellow-400"}`}>
//           {formatToDisplay(secondsLeft)}
//         </p>
//       </div>

//       <div className="flex-1 w-full max-sm flex flex-col justify-between px-6 pb-2 min-h-0 overflow-hidden">
//         {activeTab === "keypad" ? (
//           <div className="flex flex-col h-full justify-evenly">
//             <div className="shrink-0 text-center relative h-16 flex items-center justify-center">
//               {isCalling ? (
//                 <div className="flex flex-col items-center animate-pulse">
//                   <p className="text-green-400 text-2xl font-black uppercase tracking-[0.2em]">Calling...</p>
//                   <p className="text-white/40 text-xs mt-1 italic tracking-widest">{number}</p>
//                 </div>
//               ) : (
//                 <input 
//                   ref={inputRef}
//                   type="text"
//                   value={number}
//                   className="w-full bg-transparent text-white text-4xl font-light h-12 text-center outline-none italic tracking-widest caret-yellow-400"
//                   style={{ caretWidth: '2px' }}
//                   onChange={() => {}}
//                 />
//               )}
//             </div>

//             <div className={`grid grid-cols-3 gap-y-2 gap-x-4 max-w-[260px] mx-auto transition-opacity duration-300 ${isCalling ? 'opacity-10 pointer-events-none' : 'opacity-100'}`}>
//               {dialPadKeys.map(({ key, letters }) => (
//                 <button key={key} onClick={() => handleKeyClick(key)} className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white/5 border border-white/10 flex flex-col items-center justify-center active:bg-white/20 active:scale-90 transition-all mx-auto">
//                   <span className="text-xl sm:text-2xl font-bold">{key}</span>
//                   <span className="text-[7px] opacity-40 uppercase">{letters}</span>
//                 </button>
//               ))}
//             </div>

//             <div className="flex justify-between items-center px-4 shrink-0">
//               <button onClick={toggleSpeaker} className={`p-4 rounded-full ${isSpeakerOn ? 'bg-yellow-400 text-black shadow-lg' : 'bg-white/5 border border-white/10'}`}>
//                 {isSpeakerOn ? <Volume2 size={22} /> : <VolumeX size={22} />}
//               </button>
              
//               <button 
//                 className={`p-6 rounded-full shadow-xl transition-all duration-300 ${isCalling ? 'bg-red-600 scale-110 shadow-red-500/20 rotate-[135deg]' : 'bg-green-500 active:scale-90 shadow-green-500/20'}`} 
//                 onClick={isCalling ? handleHangUp : startCall}
//               >
//                 {isCalling ? <PhoneOff size={28} fill="white" /> : <Phone size={28} fill="white" />}
//               </button>

//               <button className={`p-4 rounded-full bg-white/5 border border-white/10 active:bg-red-500/10 active:text-red-400 transition-colors ${isCalling ? 'opacity-0 pointer-events-none' : 'opacity-100'}`} onClick={handleDelete}>
//                 <Delete size={22} />
//               </button>
//             </div>
//           </div>
//         ) : (
//           <div className="flex flex-col h-full pt-2 pb-4 overflow-hidden">
//              <h2 className="text-base font-black text-yellow-500 uppercase tracking-widest border-b border-white/5 pb-2 mb-4">Call History</h2>
//              <div className="flex-1 overflow-y-auto space-y-2">
//               {callHistory.length === 0 ? <p className="text-center opacity-30 mt-20 text-xs italic">No call logs yet</p> :
//                 callHistory.map((log, i) => (
//                   <div key={i} className="bg-white/5 p-3 rounded-xl flex justify-between items-center border border-white/5">
//                     <div>
//                       <p className="font-bold text-sm text-yellow-50">{log.to}</p>
//                       <p className="text-[9px] opacity-40 uppercase">{log.date} • {log.time}</p>
//                     </div>
//                     {/* *** እታ ዝተስተኻኸለት ምልክት ተለፎን (Phone Icon Logic) *** */}
//                     <button 
//                       onClick={() => {
//                         setNumber(log.to); 
//                         setActiveTab("keypad");
//                         // ድሕሪ 100ms ነቲ ቁጽሪ ሒዙ ደወል ይጅምር
//                         setTimeout(() => startCall(log.to), 100);
//                       }}
//                       className="p-2 hover:bg-green-500/20 rounded-full transition-colors"
//                     >
//                       <Phone size={14} className="text-green-400" />
//                     </button>
//                   </div>
//                 ))}
//             </div>
//           </div>
//         )}
//       </div>

//       <div className="w-full bg-black/90 backdrop-blur-xl border-t border-white/10 flex justify-around items-center py-3 shrink-0">
//         <button onClick={() => setActiveTab("history")} className={`flex flex-col items-center gap-1 flex-1 py-1 transition-colors ${activeTab === "history" ? "text-yellow-400" : "text-white/20"}`}>
//           <Clock size={20} /> <span className="text-[9px] font-black uppercase tracking-widest">History</span>
//         </button>
//         <button onClick={() => setActiveTab("keypad")} className={`flex flex-col items-center gap-1 flex-1 py-1 transition-colors ${activeTab === "keypad" ? "text-yellow-400" : "text-white/20"}`}>
//           <Grid size={20} /> <span className="text-[9px] font-black uppercase tracking-widest">Keypad</span>
//         </button>
//       </div>
//     </div>
//   );
// }

// export default Home;


import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Phone, PhoneOff, Delete, Volume2, VolumeX, LogOut, Clock, Grid, CreditCard } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom"; 

function Home({ phone, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation(); 
  const [number, setNumber] = useState("");
  const [isCalling, setIsCalling] = useState(false);
  const [isAnswered, setIsAnswered] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [callStatus, setCallStatus] = useState(null);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const [activeTab, setActiveTab] = useState("keypad");

  const inputRef = useRef(null);

  const [callHistory, setCallHistory] = useState(() => {
    const saved = localStorage.getItem("callHistory");
    return saved ? JSON.parse(saved) : [];
  });

  const parseToSeconds = (timeStr) => {
    if (!timeStr || typeof timeStr !== 'string' || !timeStr.includes(':')) return 0;
    const [m, s] = timeStr.split(':').map(val => parseInt(val) || 0);
    return (m * 60) + s;
  };

  const audioRef = useRef(new Audio("/sounds/ringings.mp3"));
  const beepRef = useRef(new Audio("/sounds/dialing.mp3"));
  const warningVoice = useRef(new Audio("/sounds/dialings.mp3"));

  useEffect(() => {
    localStorage.setItem("callHistory", JSON.stringify(callHistory));
  }, [callHistory]);

  const formatToDisplay = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const fetchMinutesFromDB = async () => {
    let userPhone = phone || location.state?.userPhone || localStorage.getItem("userPhone");
    if (!userPhone || userPhone === "No Phone") return;
    if (!userPhone.startsWith('+')) { userPhone = `+${userPhone}`; }

    try {
      const response = await axios.get(`http://localhost:5000/api/auth/user-minutes?phone=${encodeURIComponent(userPhone)}`);
      if (response.data.success) {
        setSecondsLeft(parseToSeconds(response.data.minutes));
        localStorage.setItem("userPhone", userPhone);
      }
    } catch (error) { console.error("Fetch Error", error); }
  };
  
  const syncMinutesWithDB = async (currentSeconds) => {
    const userPhone = phone || localStorage.getItem("userPhone");
    if (!userPhone) return;
    try {
      await axios.put('http://localhost:5000/api/auth/update-minutes', {
        phone: userPhone,
        remainingMinutes: formatToDisplay(currentSeconds)
      });
    } catch (err) { console.error("❌ DB Update Error", err); }
  };

  useEffect(() => {
    fetchMinutesFromDB(); 
    window.addEventListener("focus", fetchMinutesFromDB);
    return () => window.removeEventListener("focus", fetchMinutesFromDB);
  }, [phone, location.state?.refresh]);

  useEffect(() => {
    let timerInterval;
    if (isCalling && isAnswered && secondsLeft > 0) {
      timerInterval = setInterval(() => {
        setSecondsLeft(prev => {
          const nextValue = prev - 1;
          if (nextValue <= 0) { handleHangUp(); return 0; }
          if (nextValue % 5 === 0) { syncMinutesWithDB(nextValue); }
          if (nextValue === 60) warningVoice.current.play().catch(() => {});
          return nextValue;
        });
      }, 1000);
    }
    return () => clearInterval(timerInterval);
  }, [isCalling, isAnswered]);

  const handleHangUp = async () => {
    await syncMinutesWithDB(secondsLeft); 
    if (number || callStatus) {
      setCallHistory(prev => [{
        to: number || "Unknown",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        date: new Date().toLocaleDateString(),
        status: isAnswered ? "Answered" : "Missed"
      }, ...prev]);
    }
    setIsCalling(false);
    setIsAnswered(false);
    setCallStatus(null);
    setNumber(""); 
    
    // ኩሉ ድምጺ ደው ይበል
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
  };

  const startCall = (customNumber = null) => {
    const targetNumber = String(customNumber || number || ""); 
    if (!targetNumber || targetNumber.trim().length < 10) return alert("Enter a valid number!");
    if (secondsLeft <= 0) return alert("No minutes left!");

    setIsCalling(true);
    setCallStatus('ringing');
    setIsAnswered(false);

    // 1. ሪንግን (Ringing) ይጅምር
    audioRef.current.loop = true;
    audioRef.current.play().catch(e => console.log("Audio play error"));

    // 2. ምስ ተላዕለ (ድሕሪ 3 ሰከንድ ንመፈተኒ)
    setTimeout(() => { 
        setIsAnswered(true); 
        setCallStatus('connected'); 
        // 3. እቲ ሪንግን ደው ይበል፡ ሰባት ዘረባ ይጅምሩ (ደቂቕ ምቑጻር ይጅምር)
        audioRef.current.pause();
    }, 8000);
  };

  const handleKeyClick = (val) => {
    if (beepRef.current) { beepRef.current.currentTime = 0; beepRef.current.play().catch(() => { }); }
    const input = inputRef.current;
    if (!input) { setNumber(prev => prev + val); return; }
    const start = input.selectionStart;
    const end = input.selectionEnd;
    const newNumber = number.substring(0, start) + val + number.substring(end);
    setNumber(newNumber);
    setTimeout(() => { input.focus(); input.setSelectionRange(start + 1, start + 1); }, 0);
  };

  const handleDelete = () => {
    const input = inputRef.current;
    if (!input) { setNumber(prev => prev.slice(0, -1)); return; }
    const start = input.selectionStart;
    const end = input.selectionEnd;
    if (start === end && start > 0) {
      const newNumber = number.substring(0, start - 1) + number.substring(end);
      setNumber(newNumber);
      setTimeout(() => { input.focus(); input.setSelectionRange(start - 1, start - 1); }, 0);
    } else if (start !== end) {
      const newNumber = number.substring(0, start) + number.substring(end);
      setNumber(newNumber);
      setTimeout(() => { input.focus(); input.setSelectionRange(start, start); }, 0);
    }
  };

  const toggleSpeaker = () => {
    const newState = !isSpeakerOn;
    setIsSpeakerOn(newState);
    if (audioRef.current) audioRef.current.volume = newState ? 1.0 : 0.2;
  };

  const dialPadKeys = [
    { key: 1, letters: '' }, { key: 2, letters: 'ABC' }, { key: 3, letters: 'DEF' },
    { key: 4, letters: 'GHI' }, { key: 5, letters: 'JKL' }, { key: 6, letters: 'MNO' },
    { key: 7, letters: 'PQRS' }, { key: 8, letters: 'TUV' }, { key: 9, letters: 'WXYZ' },
    { key: '+', letters: '' }, { key: 0, letters: '' }, { key: '#', letters: '' }
  ];

  return (
    <div className="fixed inset-0 w-full flex flex-col items-center select-none overflow-hidden"
      style={{ background: "#020617", color: "white" }}>

      <div className="w-full flex justify-between items-start px-6 py-4 shrink-0">
        <div className="flex flex-col gap-2">
          <button onClick={onLogout} className="bg-red-600/90 active:scale-95 p-2 px-3 rounded-xl text-[10px] font-black shadow-lg flex items-center gap-1 uppercase tracking-tighter"><LogOut size={14} /> LOGOUT</button>
          <button onClick={() => navigate("/buy-card")} className="bg-green-600/90 active:scale-95 p-2 px-3 rounded-xl text-[10px] font-black shadow-lg flex items-center gap-1 uppercase tracking-tighter"><CreditCard size={14} /> Buy Card</button>
        </div>
        <div className="text-right text-yellow-500 font-black italic">Habesha Tele <p className="text-[10px] text-white opacity-50 font-mono">{phone || localStorage.getItem("userPhone")}</p></div>
      </div>

      <div className="text-center mb-1 shrink-0 cursor-pointer active:scale-95" onClick={fetchMinutesFromDB}>
        <p className="text-[9px] uppercase tracking-widest opacity-60 mb-1 font-bold">Balance</p>
        <p className={`text-5xl font-black ${secondsLeft < 60 ? "text-red-500 animate-pulse" : "text-yellow-400"}`}>{formatToDisplay(secondsLeft)}</p>
      </div>

      <div className="flex-1 w-full max-sm flex flex-col justify-between px-6 pb-2 min-h-0 overflow-hidden">
        {activeTab === "keypad" ? (
          <div className="flex flex-col h-full justify-evenly">
            <div className="shrink-0 text-center relative h-16 flex items-center justify-center">
              {isCalling ? (
                <div className="flex flex-col items-center animate-pulse">
                  <p className="text-green-400 text-2xl font-black uppercase tracking-[0.2em]">{isAnswered ? "In Call" : "Calling..."}</p>
                  <p className="text-white/40 text-xs mt-1 italic tracking-widest">{number}</p>
                </div>
              ) : (
                <input ref={inputRef} type="text" value={number} className="w-full bg-transparent text-white text-4xl font-light h-12 text-center outline-none italic tracking-widest caret-yellow-400" style={{ caretWidth: '2px' }} onChange={() => {}} />
              )}
            </div>

            <div className={`grid grid-cols-3 gap-y-2 gap-x-4 max-w-[260px] mx-auto transition-opacity duration-300 ${isCalling ? 'opacity-10 pointer-events-none' : 'opacity-100'}`}>
              {dialPadKeys.map(({ key, letters }) => (
                <button key={key} onClick={() => handleKeyClick(key)} className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white/5 border border-white/10 flex flex-col items-center justify-center active:bg-white/20 active:scale-90 mx-auto">
                  <span className="text-xl sm:text-2xl font-bold">{key}</span>
                  <span className="text-[7px] opacity-40 uppercase">{letters}</span>
                </button>
              ))}
            </div>

            <div className="flex justify-between items-center px-4 shrink-0">
              <button onClick={toggleSpeaker} className={`p-4 rounded-full ${isSpeakerOn ? 'bg-yellow-400 text-black shadow-lg' : 'bg-white/5 border border-white/10'}`}>{isSpeakerOn ? <Volume2 size={22} /> : <VolumeX size={22} />}</button>
              <button className={`p-6 rounded-full shadow-xl transition-all duration-300 ${isCalling ? 'bg-red-600 scale-110 shadow-red-500/20 rotate-[135deg]' : 'bg-green-500 active:scale-90 shadow-green-500/20'}`} onClick={isCalling ? handleHangUp : startCall}>
                {isCalling ? <PhoneOff size={28} fill="white" /> : <Phone size={28} fill="white" />}
              </button>
              <button className={`p-4 rounded-full bg-white/5 border border-white/10 active:bg-red-500/10 active:text-red-400 transition-colors ${isCalling ? 'opacity-0 pointer-events-none' : 'opacity-100'}`} onClick={handleDelete}><Delete size={22} /></button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col h-full pt-2 pb-4 overflow-hidden">
             <h2 className="text-base font-black text-yellow-500 uppercase tracking-widest border-b border-white/5 pb-2 mb-4">Call History</h2>
             <div className="flex-1 overflow-y-auto space-y-2">
              {callHistory.length === 0 ? <p className="text-center opacity-30 mt-20 text-xs italic">No logs yet</p> :
                callHistory.map((log, i) => (
                  <div key={i} className="bg-white/5 p-3 rounded-xl flex justify-between items-center border border-white/5">
                    <div>
                      <p className="font-bold text-sm text-yellow-50">{log.to}</p>
                      <p className="text-[9px] opacity-40 uppercase">{log.date} • {log.time}</p>
                    </div>
                    <button onClick={() => { setNumber(log.to); setActiveTab("keypad"); setTimeout(() => startCall(log.to), 100); }} className="p-2 hover:bg-green-500/20 rounded-full transition-colors">
                      <Phone size={14} className="text-green-400" />
                    </button>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      <div className="w-full bg-black/90 backdrop-blur-xl border-t border-white/10 flex justify-around items-center py-3 shrink-0">
        <button onClick={() => setActiveTab("history")} className={`flex flex-col items-center gap-1 flex-1 py-1 transition-colors ${activeTab === "history" ? "text-yellow-400" : "text-white/20"}`}><Clock size={20} /></button>
        <button onClick={() => setActiveTab("keypad")} className={`flex flex-col items-center gap-1 flex-1 py-1 transition-colors ${activeTab === "keypad" ? "text-yellow-400" : "text-white/20"}`}><Grid size={20} /></button>
      </div>
    </div>
  );
}

export default Home;