
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Phone, PhoneOff, Delete, Volume2, VolumeX, LogOut, Clock, Grid, CreditCard } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom"; // useLocation ተወሲኻ ኣላ

function Home({ phone, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation(); // <--- እዚኣ ኣገዳሲት እያ
  const [number, setNumber] = useState("");
  const [isCalling, setIsCalling] = useState(false);
  const [isAnswered, setIsAnswered] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [callStatus, setCallStatus] = useState(null);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const [activeTab, setActiveTab] = useState("keypad");

  const [callHistory, setCallHistory] = useState(() => {
    const saved = localStorage.getItem("callHistory");
    return saved ? JSON.parse(saved) : [];
  });

  // Home.jsx ውሽጢ እዛ function ተካኣ
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

  // --- Logic Helpers ---
  const formatToDisplay = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };


  // ካብ Database ባላንስ ንምምጻእ

  const fetchMinutesFromDB = async () => {
    // 1. ካብ Props ወይ localStorage ነቲ ቁጽሪ ነምጽእ
    let userPhone = phone || location.state?.userPhone || localStorage.getItem("userPhone");

    if (!userPhone || userPhone === "No Phone") return;

    // *** ኣገዳሲት መፍትሒ ***
    // እቲ ቁጽሪ ብ '+' ከም ዝጅምር ነረጋግጽ፡ እንተዘይሃልዩ ንውስኸሉ
    if (!userPhone.startsWith('+')) {
      userPhone = `+${userPhone}`;
    }

    try {
      const response = await axios.get(`http://localhost:5000/api/auth/user-minutes?phone=${encodeURIComponent(userPhone)}`);
      if (response.data.success) {
        setSecondsLeft(parseToSeconds(response.data.minutes));
        // ነቲ ዝተስተኻኸለ ቁጽሪ (ምስ + ዘሎ) ንዕቅቦ
        localStorage.setItem("userPhone", userPhone);
      }
    } catch (error) { 
      console.error("Fetch Error", error); 
    }
  };
  
  const syncMinutesWithDB = async (currentSeconds) => {
    const userPhone = phone || location.state?.userPhone || localStorage.getItem("userPhone");
    if (!userPhone) return;
    try {
      await axios.put('http://localhost:5000/api/auth/update-minutes', {
        phone: userPhone,
        remainingMinutes: formatToDisplay(currentSeconds)
      });
    } catch (err) { console.error("❌ DB Update Error"); }
  };

  // --- Real-time Refresh Logic ---
  useEffect(() => {
    fetchMinutesFromDB(); 

    // ገጽ Focus ምስ ገበረ ባዕሉ ዳታ የሐድስ
    window.addEventListener("focus", fetchMinutesFromDB);
    return () => window.removeEventListener("focus", fetchMinutesFromDB);
  }, [phone, location.state?.refresh]); // <--- እታ refresh ምስ ተላእከት ባዕሉ Update ይገብር

  useEffect(() => {
    let timerInterval;
    if (isCalling && isAnswered && secondsLeft > 0) {
      timerInterval = setInterval(() => {
        setSecondsLeft(prev => {
          const nextValue = prev - 1;
          if (nextValue <= 0) { handleHangUp(); return 0; }
          
          if (nextValue % 10 === 0) {
            syncMinutesWithDB(nextValue);
          }
          
          if (nextValue === 60) warningVoice.current.play();
          return nextValue;
        });
      }, 1000);
    }
    return () => clearInterval(timerInterval);
  }, [isCalling, isAnswered]);

  const handleHangUp = async () => {
    await syncMinutesWithDB(secondsLeft); 
    if (number) {
      setCallHistory(prev => [{
        to: number,
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
    const targetNumber = customNumber || number;
    if (!targetNumber || targetNumber.trim().length < 10) return alert("Enter a valid number!");
    if (secondsLeft <= 0) return alert("No minutes left! Please buy a card.");
    setIsCalling(true);
    setCallStatus('ringing');
    setIsAnswered(false);
    audioRef.current.loop = true;
    audioRef.current.play().catch(() => { });
    setTimeout(() => { 
        setIsAnswered(true); 
        setCallStatus('connected'); 
        audioRef.current.pause();
    }, 3000);
  };

  const handleKeyClick = (val) => {
    if (beepRef.current) { beepRef.current.currentTime = 0; beepRef.current.play().catch(() => { }); }
    setNumber(prev => prev + val);
  };

  const handleDelete = () => {
    setNumber(prev => prev.slice(0, -1));
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
          <button onClick={onLogout} className="bg-red-600/90 active:scale-95 p-2 px-3 rounded-xl text-[10px] font-black shadow-lg flex items-center gap-1 uppercase tracking-tighter">
            <LogOut size={14} /> LOGOUT
          </button>
          <button onClick={() => navigate("/buy-card")} className="bg-green-600/90 active:scale-95 p-2 px-3 rounded-xl text-[10px] font-black shadow-lg flex items-center gap-1 uppercase tracking-tighter">
            <CreditCard size={14} /> Buy Card
          </button>
        </div>
        <div className="text-right text-yellow-500 font-black italic">
          Habesha Tele
          <p className="text-[10px] text-white opacity-50 font-mono">{phone || localStorage.getItem("userPhone")}</p>
        </div>
      </div>

      <div className="text-center mb-1 shrink-0 cursor-pointer active:scale-95" onClick={fetchMinutesFromDB}>
        <p className="text-[9px] uppercase tracking-widest opacity-60 mb-1 font-bold">Remaining Balance</p>
        <p className={`text-5xl font-black ${secondsLeft < 60 ? "text-red-500 animate-pulse" : "text-yellow-400"}`}>
          {formatToDisplay(secondsLeft)}
        </p>
      </div>

      <div className="flex-1 w-full max-sm flex flex-col justify-between px-6 pb-2 min-h-0 overflow-hidden">
        {activeTab === "keypad" ? (
          <div className="flex flex-col h-full justify-evenly">
            <div className="shrink-0 text-center">
              <div className="text-white text-4xl font-light h-12 italic tracking-widest">{number || " "}</div>
              <div className="h-4 mt-1">
                {callStatus === 'ringing' && <p className="text-green-400 text-[9px] animate-pulse font-bold uppercase">Calling...</p>}
                {isAnswered && <p className="text-yellow-400 text-[9px] font-bold uppercase animate-bounce">In Call</p>}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-y-2 gap-x-4 max-w-[260px] mx-auto">
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
              <button className={`p-6 rounded-full shadow-xl ${isCalling ? 'bg-red-500 animate-pulse' : 'bg-green-500 active:scale-90'}`} onClick={isCalling ? handleHangUp : startCall}>
                {isCalling ? <PhoneOff size={28} fill="white" /> : <Phone size={28} fill="white" />}
              </button>
              <button className="p-4 rounded-full bg-white/5 border border-white/10 active:bg-red-500/10 active:text-red-400 transition-colors" onClick={handleDelete}>
                <Delete size={22} />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col h-full pt-2 pb-4">
            <h2 className="text-base font-black text-yellow-500 uppercase tracking-widest border-b border-white/5 pb-2 mb-4">Call History</h2>
            <div className="flex-1 overflow-y-auto space-y-2">
              {callHistory.length === 0 ? <p className="text-center opacity-30 mt-20 text-xs italic">No call logs yet</p> :
                callHistory.map((log, i) => (
                  <div key={i} className="bg-white/5 p-3 rounded-xl flex justify-between items-center border border-white/5">
                    <div>
                      <p className="font-bold text-sm text-yellow-50">{log.to}</p>
                      <p className="text-[9px] opacity-40 uppercase">{log.date} • {log.time}</p>
                    </div>
                    <Phone size={14} className="text-green-400" />
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      <div className="w-full bg-black/90 backdrop-blur-xl border-t border-white/10 flex justify-around items-center py-3 shrink-0">
        <button onClick={() => setActiveTab("history")} className={`flex flex-col items-center gap-1 flex-1 py-1 transition-colors ${activeTab === "history" ? "text-yellow-400" : "text-white/20"}`}>
          <Clock size={20} /> <span className="text-[9px] font-black uppercase tracking-widest">History</span>
        </button>
        <button onClick={() => setActiveTab("keypad")} className={`flex flex-col items-center gap-1 flex-1 py-1 transition-colors ${activeTab === "keypad" ? "text-yellow-400" : "text-white/20"}`}>
          <Grid size={20} /> <span className="text-[9px] font-black uppercase tracking-widest">Keypad</span>
        </button>
      </div>
    </div>
  );
}

export default Home;