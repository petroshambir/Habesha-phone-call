import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { Phone, PhoneOff, Video, VideoOff } from "lucide-react";

// 🔄 ምስቲ ናትካ ናይ Render ሰርቨር ቀጥታ ነላግቦ
const socket = io("https://habesha-phone-call-4.onrender.com");

// 🔄 ሓዳስ ክፍሊ 1፦ ካብ Home.jsx ዝመጽእ ናይቲ ክድወለሉ ዝተሓረየ ሰብ ቁጽሪ (targetPhone) ከም Prop ይቕበል
function VideoCall({ targetPhone }) {
  const [myId, setMyId] = useState("");
  const [targetId, setTargetId] = useState("");
  const [calling, setCalling] = useState(false);
  const [callAccepted, setCallAccepted] = useState(false);
  const [incomingCall, setIncomingCall] = useState(null);

  const myVideoRef = useRef(null);
  const userVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);

  // 🔄 100% ነጻ ዝኾነ ናይ Google STUN ሰርቨር (ኔትወርክ ንምስባር)
  const rtcConfig = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" }
    ]
  };

  useEffect(() => {
    // 1. ካሜራን ማይክሮፎንን ብነጻ ምኽፋት
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((stream) => {
        localStreamRef.current = stream;
        if (myVideoRef.current) myVideoRef.current.srcObject = stream;
      })
      .catch((err) => console.error("Camera access error:", err));

    // 2. ናይ ባዕልኻ ኔትወርክ መለለዪ ID ካብ ሰርቨር ምቕባል
    socket.on("connect", () => {
      setMyId(socket.id);
      
      // 🔄 ሓዳስ ክፍሊ 2፦ ባዕልኻ ምስ ከፈትካዮ ቁጽሪ ስልካ ምስዚ ሓድሽ Socket ID ኣላጊብካ ኣብ ሰርቨር Auto-Register ይገብሮ
      const myPhone = localStorage.getItem("userPhone");
      if (myPhone) {
        socket.emit("register-user", myPhone);
      }
    });

    // 3. ጻውዒት ክመጸካ ከሎ ምስማዕ
    socket.on("incoming-call", (data) => {
      setIncomingCall({ from: data.from, offer: data.offer });
    });

    return () => {
      socket.off("incoming-call");
    };
  }, []);

  // 🔄 ሓዳስ ክፍሊ 3፦ ካብ ታሪኽ (History) ቁጽሪ ስልኪ ሒዙ እንተመጺኡ፣ ብድሕሪ ባይታ Socket ID ሓቲቱ ባዕሉ ይድውል
  useEffect(() => {
    if (targetPhone && targetPhone.trim().length >= 10) {
      // ቀጥታ ናብ ሰርቨር ኸይዱ ናይቲ ቊጽሪ ሓቀኛ Socket ID ይሓትት
      socket.emit("get-user-socket", targetPhone, (response) => {
        if (response.success && response.socketId) {
          setTargetId(response.socketId);
          // 2 ሚሊሰከንድ ኣዕሪፉ ባዕሉ እቲ ጻውዒት ንኪጅምር
          setTimeout(() => {
            startVideoCallWithId(response.socketId);
          }, 200);
        } else {
          alert(response.message || "User is offline");
        }
      });
    }
  }, [targetPhone]);

  useEffect(() => {
    if (!incomingCall) return;

    // 4. እቲ ዝድውለልካ ዘሎ ሰብ ኔትወርክ መገዲ (ICE Candidate) ምቕባል
    socket.on("ice-candidate", async (data) => {
      if (peerConnectionRef.current) {
        await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
      }
    });

    return () => socket.off("ice-candidate");
  }, [incomingCall]);

  // 🔄 ሓዳስ ክፍሊ 4፦ ነቲ ናይ ምድዋል ሎጂክ ብወግዒ ብ Socket ID ንክሰርሕ ንበይኑ ንምፍላይ
  const startVideoCallWithId = async (socketId) => {
    if (!socketId) return;
    setCalling(true);

    const pc = new RTCPeerConnection(rtcConfig);
    peerConnectionRef.current = pc;

    localStreamRef.current.getTracks().forEach(track => pc.addTrack(track, localStreamRef.current));

    pc.ontrack = (event) => {
      if (userVideoRef.current) userVideoRef.current.srcObject = event.streams[0];
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", { to: socketId, candidate: event.candidate });
      }
    };

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    socket.emit("call-user", { to: socketId, from: socket.id, offer });

    socket.on("call-accepted", async (data) => {
      setCallAccepted(true);
      await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
    });
  };

  // 🔄 እቲ ናትካ ቀደም ዝነበረ ኖርማል ናይ ኢድ መደወሊ ቁልፍ (Manual Call)
  const startVideoCall = async () => {
    if (!targetId) return alert("Enter target Socket ID!");
    await startVideoCallWithId(targetId);
  };

  // 🔄 ንዝመጸካ ጻውዒት ምቕባል (Answer Call)
  const answerVideoCall = async () => {
    if (!incomingCall) return;
    setCallAccepted(true);

    const pc = new RTCPeerConnection(rtcConfig);
    peerConnectionRef.current = pc;

    localStreamRef.current.getTracks().forEach(track => pc.addTrack(track, localStreamRef.current));

    pc.ontrack = (event) => {
      if (userVideoRef.current) userVideoRef.current.srcObject = event.streams[0];
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", { to: incomingCall.from, candidate: event.candidate });
      }
    };

    // ናይቲ ዝደወለልካ ሰብ ጻውዒት ምቕባል
    await pc.setRemoteDescription(new RTCSessionDescription(incomingCall.offer));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    socket.emit("answer-call", { to: incomingCall.from, answer });
    setIncomingCall(null);
  };

  // 🔄 ጻውዒት ምዕጻው (Hang Up)
  const endVideoCall = () => {
    if (peerConnectionRef.current) peerConnectionRef.current.close();
    setCalling(false);
    setCallAccepted(false);
    setIncomingCall(null);
    if (userVideoRef.current) userVideoRef.current.srcObject = null;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white p-4">
      <h2 className="text-xl font-black text-yellow-500 mb-2 uppercase tracking-widest">Habesha Video Call</h2>
      <p className="text-xs text-white/50 mb-4 font-mono">Your ID: <span className="text-green-400 font-bold">{myId || "Connecting..."}</span></p>

      {/* 🔄 ናይ ቪድዮ መርኣዪ ስክሪናት */}
      <div className="relative w-full max-w-md aspect-video bg-black rounded-2xl overflow-hidden border border-white/10 shadow-2xl mb-6">
        {/* ናይቲ ዝዛረበካ ዘሎ ሰብ ዓብዪ ቪድዮ */}
        <video ref={userVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
        
        {/* ናትካ ናይ ጻዕዳ ንእሽቶ ቪድዮ (ኣብ ልዕሊኡ ተንጠልጢላ ዘላ) */}
        <div className="absolute bottom-3 right-3 w-28 aspect-video bg-slate-900 rounded-xl overflow-hidden border border-white/20 z-10">
          <video ref={myVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
        </div>
      </div>

      {/* 🔄 መቆጻጸሪ ቁልፍታት */}
      <div className="w-full max-w-xs flex flex-col gap-3">
        {!callAccepted && !incomingCall && (
          <div className="flex flex-col gap-2">
            <input 
              type="text" 
              placeholder="Enter friend's ID..." 
              value={targetId}
              onChange={(e) => setTargetId(e.target.value)}
              className="w-full bg-white/5 border border-white/10 p-3 rounded-xl text-center outline-none text-sm font-mono focus:border-yellow-500 transition-colors"
            />
            <button onClick={startVideoCall} disabled={calling} className="w-full bg-green-600 active:scale-95 p-3 rounded-xl font-bold text-sm shadow-lg flex items-center justify-center gap-2 uppercase tracking-wider transition-transform">
              <Video size={18} /> {calling ? "Ringing..." : "Start Video Call"}
            </button>
          </div>
        )}

        {/* ዝመጸካ ጻውዒት እንተሃሊዩ ንምቕባል ዝመጽእ ማዕጾ */}
        {incomingCall && (
          <div className="bg-white/5 border border-yellow-500/30 p-4 rounded-xl text-center animate-pulse">
            <p className="text-xs text-yellow-400 font-bold uppercase tracking-wider mb-2">Incoming Video Call...</p>
            <button onClick={answerVideoCall} className="w-full bg-yellow-500 text-black p-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 uppercase tracking-wider">
              <Video size={18} /> Answer Call
            </button>
          </div>
        )}

        {(callAccepted || calling) && (
          <button onClick={endVideoCall} className="w-full bg-red-600 active:scale-95 p-3 rounded-xl font-bold text-sm shadow-lg flex items-center justify-center gap-2 uppercase tracking-wider transition-transform">
            <PhoneOff size={18} /> End Call
          </button>
        )}
      </div>
    </div>
  );
}

export default VideoCall;