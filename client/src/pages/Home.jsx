

import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Phone, PhoneOff, Delete, Volume2, VolumeX, LogOut, Clock, Grid, CreditCard, } from "lucide-react"; 
// import { Phone, PhoneOff, Delete, Volume2, VolumeX, LogOut, Clock, Grid, CreditCard, Video } from "lucide-react"; // 🔄 ቪድዮ ምስሊ ጥራሕ ተወሲኻ ኣላ
import { useNavigate, useLocation } from "react-router-dom"; 
// import VideoCall from "../components/VideoCall"; // 🔄 እቲ ቪድዮ ገጽ ኣላ። እቲ `VideoCall` ኮምፖነንት ውስጥ ዝተረደኣናሉ ዳይናሚክ ቪድዮ ፎን ፎቶ ሳይዝ ፈንክሽን (Fit) ኣሎ።

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
      const response = await axios.get(`https://habesha-phone-call-4.onrender.com/api/auth/user-minutes?phone=${encodeURIComponent(userPhone)}`);
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
      await axios.put('https://habesha-phone-call-4.onrender.com/api/auth/update-minutes', {
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
    
    audioRef.current.volume = isSpeakerOn ? 1.0 : 0.2;
    audioRef.current.loop = true;
    audioRef.current.play().catch(e => console.log("Audio play error"));

    setTimeout(() => { 
        setIsAnswered(true); 
        setCallStatus('connected'); 
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
    if (audioRef.current) {
      audioRef.current.volume = newState ? 1.0 : 0.2; 
    }
  };

  const getFontSizeClass = () => {
    if (number.length > 14) return "text-xl";
    if (number.length > 11) return "text-2xl";
    if (number.length > 8) return "text-3xl";
    return "text-4xl";
  };

  const dialPadKeys = [
    { key: 1, letters: '' }, { key: 2, letters: 'ABC' }, { key: 3, letters: 'DEF' },
    { key: 4, letters: 'GHI' }, { key: 5, letters: 'JKL' }, { key: 6, letters: 'MNO' },
    { key: 7, letters: 'PQRS' }, { key: 8, letters: 'TUV' }, { key: 9, letters: 'WXYZ' },
    { key: '+', letters: '' }, { key: 0, letters: '' }, { key: '#', letters: '' }
  ];

  // 🔄 ሓዳስ ክፍሊ፦ እቲ ገጽ ንምቕያር ዝሕግዝ ናይ ሬንደር ሎጂክ
  const renderTabContent = () => {
    if (activeTab === "history") {
      return (
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
                  {/* 🔄 እታ ዝተስተኻኸለት ክፍሊ፦ ኣብ ታሪኽ ኣብ ጎና ናይ ቪድዮ ምስሊ ቁልፍ ተገጢማ ኣላ */}
                  <div className="flex items-center gap-1">
                    {/* <button onClick={() => { setNumber(log.to); setActiveTab("video"); }} className="p-2 hover:bg-yellow-500/20 rounded-full transition-colors">
                      <Video size={14} className="text-yellow-400" />
                    </button> */}
                    <button onClick={() => { setNumber(log.to); setActiveTab("keypad"); setTimeout(() => startCall(log.to), 100); }} className="p-2 hover:bg-green-500/20 rounded-full transition-colors">
                      <Phone size={14} className="text-green-400" />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      );
    }
    
    // if (activeTab === "video") {
    //   return <VideoCall targetPhone={number} />; // 👈 እታ ሓዳስ ናይ ቪድዮ ገጽ ኣብዚኣ ትኽፈት (ነቲ ቁጽሪ ሒዛ ትከይድ)
    // }

    // Default: keypad
    return (
      <div className="flex flex-col h-full justify-evenly">
        <div className="shrink-0 text-center relative h-16 flex items-center justify-center">
          {isCalling ? (
            <div className="flex flex-col items-center animate-pulse">
              <p className="text-green-400 text-2xl font-black uppercase tracking-[0.2em]">{isAnswered ? "In Call" : "Calling..."}</p>
              <p className="text-white/40 text-xs mt-1 italic tracking-widest">{number}</p>
            </div>
          ) : (
            <input 
              ref={inputRef} 
              type="text" 
              value={number} 
              inputMode="none"
              className={`w-full max-w-[320px] px-2 bg-transparent text-white font-bold h-14 text-center outline-none italic tracking-widest caret-yellow-400 transition-all duration-150 ${getFontSizeClass()}`} 
              style={{ caretWidth: '2px' }} 
              onChange={() => {}} 
            />
          )}
        </div>

        <div className={`grid grid-cols-3 gap-y-2 gap-x-4 max-w-[260px] mx-auto transition-opacity duration-300 ${isCalling ? 'opacity-10 pointer-events-none' : 'opacity-100'}`}>
          {dialPadKeys.map(({ key, letters }) => (
            <button key={key} onClick={() => handleKeyClick(key)} className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white/5 border border-white/10 flex flex-col items-center justify-center active:bg-white/20 active:scale-90 transition-all mx-auto">
              <span className="text-xl sm:text-2xl font-bold">{key}</span>
              <span className="text-[7px] opacity-40 uppercase">{letters}</span>
            </button>
          ))}
        </div>

        <div className="flex justify-between items-center px-4 shrink-0">
          <button onClick={toggleSpeaker} className={`p-4 rounded-full ${isSpeakerOn ? 'bg-yellow-400 text-black shadow-lg' : 'bg-white/5 border border-white/10'}`}>
            {isSpeakerOn ? <Volume2 size={22} /> : <VolumeX size={22} />}
          </button>
          <button className={`p-6 rounded-full shadow-xl transition-all duration-300 ${isCalling ? 'bg-red-600 scale-110 shadow-red-500/20 rotate-[135deg]' : 'bg-green-500 active:scale-90 shadow-green-500/20'}`} onClick={isCalling ? handleHangUp : startCall}>
            {isCalling ? <PhoneOff size={28} fill="white" /> : <Phone size={28} fill="white" />}
          </button>
          <button className={`p-4 rounded-full bg-white/5 border border-white/10 active:bg-red-500/10 active:text-red-400 transition-colors ${isCalling ? 'opacity-0 pointer-events-none' : 'opacity-100'}`} onClick={handleDelete}><Delete size={22} /></button>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 w-full flex flex-col items-center select-none overflow-hidden"
      style={{ background: "#020617", color: "white" }}>

      <div className="w-full flex justify-between items-start px-6 py-4 shrink-0">
        <div className="flex flex-col gap-2">
          <button onClick={onLogout} className="bg-red-600/90 active:scale-95 p-2 px-3 rounded-xl text-[10px] font-black shadow-lg flex items-center gap-1 uppercase tracking-tighter"><LogOut size={14} /> LOGOUT</button>
          <button onClick={() => navigate("/buy-card")} className="bg-green-600/90 active:scale-95 p-2 px-3 rounded-xl text-[10px] font-black shadow-lg flex items-center gap-1 uppercase tracking-tighter"><CreditCard size={14} /> Buy Card</button>
        </div>
        {/* 🔄 እታ ዝተስተኻኸለት ክፍሊ፦ ሕጂ እታ ናይ ቪድዮ ቁልፍ ኣብ ላዕሊ ኣብ ጎኒ እቲ ጽሑፍ ተገጢማ ኣላ */}
        <div className="text-right flex items-center gap-2">
          {/* <button onClick={() => setActiveTab(activeTab === "video" ? "keypad" : "video")} className={`p-2 rounded-xl transition-colors ${activeTab === "video" ? "bg-yellow-400 text-black shadow-lg" : "bg-white/5 text-white/70 hover:bg-white/10"}`}>
            <Video size={18} />
          </button> */}
          <div className="text-right text-yellow-500 font-black italic">Habesha Tele <p className="text-[10px] text-white opacity-50 font-mono">{phone || localStorage.getItem("userPhone")}</p></div>
        </div>
      </div>

      <div className="text-center mb-1 shrink-0 cursor-pointer active:scale-95" onClick={fetchMinutesFromDB}>
        <p className="text-[9px] uppercase tracking-widest opacity-60 mb-1 font-bold">Remaining Balance</p>
        <p className={`text-5xl font-black ${secondsLeft < 60 ? "text-red-500 animate-pulse" : "text-yellow-400"}`}>{formatToDisplay(secondsLeft)}</p>
      </div>

      <div className="flex-1 w-full max-sm flex flex-col justify-between px-6 pb-2 min-h-0 overflow-hidden">
        {renderTabContent()} 
      </div>

      <div className="w-full bg-black/90 backdrop-blur-xl border-t border-violet-900 flex justify-around items-center py-3 shrink-0">
        <button onClick={() => setActiveTab("history")} className={`flex flex-col items-center gap-1 flex-1 py-1 transition-colors ${activeTab === "history" ? "text-yellow-400" : "text-white/50"}`}><Clock size={20} /></button>
        <button onClick={() => setActiveTab("keypad")} className={`flex flex-col items-center gap-1 flex-1 py-1 transition-colors ${activeTab === "keypad" ? "text-yellow-400" : "text-white/50"}`}><Grid size={20} /></button>
      </div>
    </div>
  );
}

export default Home;