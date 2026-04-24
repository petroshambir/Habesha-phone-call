import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Phone, PhoneOff, Delete, Volume2, VolumeX, LogOut, Clock, Grid, Trash2, CreditCard, Globe } from "lucide-react";
import { useNavigate } from "react-router-dom";

function Home({ phone, onLogout }) {
  const navigate = useNavigate();
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

  const audioRef = useRef(new Audio("/sounds/ringings.mp3"));
  const beepRef = useRef(new Audio("/sounds/dialing.mp3"));
  const warningVoice = useRef(new Audio("/sounds/dialings.mp3"));
  const inputRef = useRef(null);

  useEffect(() => {
    localStorage.setItem("callHistory", JSON.stringify(callHistory));
  }, [callHistory]);

  const formatToDisplay = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const parseToSeconds = (timeStr) => {
    if (typeof timeStr !== 'string') return Number(timeStr) * 60 || 0;
    const [m, s] = timeStr.split(':').map(Number);
    return (m * 60) + (s || 0);
  };

  const syncMinutesWithDB = async (currentSeconds) => {
    if (!phone) return;
    try {
      const timeString = formatToDisplay(currentSeconds);
      await axios.put('http://localhost:5000/api/auth/update-minutes', {
        phone: phone,
        remainingMinutes: timeString
      });
    } catch (err) { console.error("❌ DB Update Error"); }
  };

  const fetchMinutes = async () => {
    if (!phone) return;
    try {
      // const response = await axios.get(`http://localhost:5000/api/auth/user-minutes?phone=${encodeURIComponent(phone)}`);
      // setSecondsLeft(parseToSeconds(response.data.minutes));
    } catch (error) { console.error("Fetch Error"); }
  };

  useEffect(() => { if (phone) fetchMinutes(); }, [phone]);

  useEffect(() => {
    if (!phone) return;
    const eventSource = new EventSource(`http://localhost:5000/api/auth/updates?phone=${phone}`);
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "call_answered") {
        setIsAnswered(true);
        setCallStatus('connected');
        audioRef.current.pause();
      }
    };
    eventSource.onerror = () => eventSource.close();
    return () => eventSource.close();
  }, [phone]);

  useEffect(() => {
    let timerInterval;
    if (isCalling && isAnswered && secondsLeft > 0) {
      timerInterval = setInterval(() => {
        setSecondsLeft(prev => {
          const nextValue = prev - 1;
          if (nextValue <= 0) { handleHangUp(); return 0; }
          if (nextValue % 10 === 0) syncMinutesWithDB(nextValue);
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
    if (secondsLeft <= 0) return alert("No minutes left!");
    if (customNumber) setNumber(customNumber);
    setIsCalling(true);
    setCallStatus('ringing');
    setIsAnswered(false);
    audioRef.current.loop = true;
    audioRef.current.volume = isSpeakerOn ? 1.0 : 0.2;
    audioRef.current.play().catch(() => { });
  };

  const handleHistoryCall = (clickedNumber) => {
    setActiveTab("keypad");
    setNumber(clickedNumber);
    setTimeout(() => { startCall(clickedNumber); }, 500);
  };

  const toggleSpeaker = () => {
    const newState = !isSpeakerOn;
    setIsSpeakerOn(newState);
    beepRef.current.currentTime = 0;
    beepRef.current.play().catch(() => { });
    if (audioRef.current) { audioRef.current.volume = newState ? 1.0 : 0.2; }
  };

  const handleKeyClick = (val) => {
    if (beepRef.current) {
      beepRef.current.currentTime = 0;
      beepRef.current.play().catch(() => { });
    }
    const input = inputRef.current;
    const start = input.selectionStart;
    const end = input.selectionEnd;
    const newText = number.substring(0, start) + val + number.substring(end);
    setNumber(newText);
    setTimeout(() => {
      if (input) {
        input.selectionStart = input.selectionEnd = start + 1;
        input.focus();
      }
    }, 0);
  };

  const handleDelete = () => {
    const input = inputRef.current;
    const start = input.selectionStart;
    const end = input.selectionEnd;
    if (start === end && start > 0) {
      const newText = number.substring(0, start - 1) + number.substring(end);
      setNumber(newText);
      setTimeout(() => {
        input.selectionStart = input.selectionEnd = start - 1;
        input.focus();
      }, 0);
    } else {
      const newText = number.substring(0, start) + number.substring(end);
      setNumber(newText);
      setTimeout(() => {
        input.selectionStart = input.selectionEnd = start;
        input.focus();
      }, 0);
    }
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

          <button 
            onClick={() => navigate("/rates")} 
            className="bg-blue-600/90 active:scale-95 p-2 px-3 rounded-xl text-[10px] font-black shadow-lg flex items-center gap-1 uppercase tracking-tighter"
          >
            <Globe size={14} /> Check Card Rates
          </button>
        </div>

        <div className="text-right">
          <h1 className="text-lg font-black text-yellow-500 italic tracking-tighter leading-none">Habesha Tele</h1>
          <p className="text-[10px] opacity-50 font-mono">{phone}</p>
        </div>
      </div>

      <div className="text-center mb-1 shrink-0">
        <p className="text-[9px] uppercase tracking-widest opacity-60 mb-1 font-bold">Remaining Balance</p>
        <p className={`text-5xl font-black ${secondsLeft < 60 ? "text-red-500 animate-pulse" : "text-yellow-400"}`}>
          {formatToDisplay(secondsLeft)}
        </p>
      </div>

      <div className="flex-1 w-full max-w-sm flex flex-col justify-between px-6 pb-2 min-h-0 overflow-hidden">
        {activeTab === "keypad" ? (
          <div className="flex flex-col h-full justify-evenly">
            <div className="shrink-0">
              <input
                ref={inputRef}
                type="text"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                inputMode="none"
                className="w-full bg-transparent text-white text-4xl text-center font-light outline-none h-12 caret-yellow-400"
                autoFocus
              />
              <div className="h-4 text-center mt-1">
                {callStatus === 'ringing' && <p className="text-green-400 text-[9px] animate-pulse font-bold tracking-[0.2em] uppercase">Calling...</p>}
                {callStatus === 'connected' && <p className="text-yellow-400 text-[9px] font-bold uppercase tracking-widest">Connected</p>}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-y-2 gap-x-4 max-w-[260px] mx-auto">
              {dialPadKeys.map(({ key, letters }) => (
                <button
                  key={key}
                  onClick={() => handleKeyClick(key)}
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white/5 border border-white/10 flex flex-col items-center justify-center active:bg-white/20 active:scale-90 transition-all mx-auto"
                >
                  <span className="text-xl sm:text-2xl font-bold">{key}</span>
                  <span className="text-[7px] opacity-40 uppercase">{letters}</span>
                </button>
              ))}
            </div>

            <div className="flex justify-between items-center px-4 shrink-0">
              <button onClick={toggleSpeaker} className={`p-4 rounded-full ${isSpeakerOn ? 'bg-yellow-400 text-black shadow-lg shadow-yellow-400/20' : 'bg-white/5 border border-white/10'}`}>
                {isSpeakerOn ? <Volume2 size={22} /> : <VolumeX size={22} />}
              </button>
              {!isCalling ? (
                <button className="p-6 bg-green-500 rounded-full shadow-xl shadow-green-500/20 active:scale-90 transition-all" onClick={() => startCall()}>
                  <Phone size={28} fill="white" />
                </button>
              ) : (
                <button className="p-6 bg-red-500 rounded-full shadow-xl shadow-red-500/20 animate-pulse" onClick={handleHangUp}>
                  <PhoneOff size={28} fill="white" />
                </button>
              )}
              <button className="p-4 rounded-full bg-white/5 border border-white/10 active:bg-red-500/20 active:text-red-400 transition-colors" onClick={handleDelete}>
                <Delete size={22} />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col h-full pt-2 pb-4 animate-in slide-in-from-right duration-300">
            <div className="flex justify-between items-center mb-4 shrink-0 border-b border-white/5 pb-2">
              <h2 className="text-base font-black text-yellow-500 uppercase tracking-widest">Call History</h2>
              <button onClick={() => setCallHistory([])} className="text-red-400 text-[10px] font-bold flex items-center gap-1 p-2 uppercase">
                <Trash2 size={14} /> Clear
              </button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-2 scrollbar-hide">
              {callHistory.length === 0 ? <p className="text-center opacity-30 mt-20 text-xs italic">No call logs yet</p> :
                callHistory.map((log, i) => (
                  <div key={i} className="bg-white/5 p-3 rounded-xl flex justify-between items-center border border-white/5">
                    <div className="overflow-hidden">
                      <p className="font-bold text-sm text-yellow-50 truncate">{log.to}</p>
                      <p className="text-[9px] opacity-40 uppercase tracking-tighter">{log.date} • {log.time} • {log.status}</p>
                    </div>
                    <button onClick={() => handleHistoryCall(log.to)} className="p-3 bg-green-500/10 rounded-full text-green-400 active:bg-green-500 active:text-white transition-colors">
                      <Phone size={14} fill="currentColor" />
                    </button>
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