import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { LogOut, Send, History, Wallet, ShieldCheck, CreditCard, Menu } from 'lucide-react';
import api from '../api';
import { useAuth } from '../context/AuthContext';

// --- IMAGE ASSETS ---
const SHARK_IMAGE = "/shark-character.png"; 
const FROG_IMAGE = "/frog-character.png"; 

const Dashboard = () => {
  const { logout, user: contextUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [users, setUsers] = useState([]);
  const [transferData, setTransferData] = useState({ receiver_username: '', amount: '' });
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Randomly select character on mount
  const [characterImage] = useState(() => Math.random() > 0.5 ? SHARK_IMAGE : FROG_IMAGE);
  const navigate = useNavigate();
  
  // Animation Refs
  const titleRef = useRef(null);
  const blackLayerRef = useRef(null);
  const darkPinkLayerRef = useRef(null);
  const pinkSectionRef = useRef(null);
  const characterRef = useRef(null);
  const contentRef = useRef(null);

  // --- DYNAMIC COLORS ---
  // Determine colors based on the active character
  const isFrog = characterImage === FROG_IMAGE;
  const middleCardColor = isFrog ? '#636b2f' : '#505081';
  const frontCardColor = isFrog ? '#bac095' : '#6d8196'; 

  // --- DYNAMIC STYLING LOGIC ---
  const getCharacterStyles = () => {
    if (isFrog) {
        return "md:left-[33rem] md:-translate-x-1/4 h-[70%] md:h-[130%]";
    } else {
        return "md:left-[5rem] md:-translate-x-1/2 h-[70%] md:h-[137%]";
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, historyRes, usersRes] = await Promise.all([
          api.get('/profile/'),
          api.get('/transactions/'),
          api.get('/users/')
        ]);
        setProfile(profileRes.data);
        setTransactions(historyRes.data);
        setUsers(usersRes.data);
      } catch (error) {
        if (error.response && error.response.status === 401) logout();
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleTransfer = async (e) => {
    e.preventDefault();
    setMsg({ type: '', text: '' });
    if (!transferData.receiver_username) return setMsg({ type: 'error', text: 'Select a receiver.' });
    try {
      await api.post('/transfer/', transferData);
      setMsg({ type: 'success', text: 'Transfer Successful!' });
      setTransferData({ receiver_username: '', amount: '' });
      const [profileRes, historyRes] = await Promise.all([api.get('/profile/'), api.get('/transactions/')]);
      setProfile(profileRes.data);
      setTransactions(historyRes.data);
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.error || 'Transfer Failed' });
    }
  };

  useGSAP(() => {
    if (loading) return;
    const tl = gsap.timeline();
    
    tl.from(titleRef.current, { y: -50, opacity: 0, duration: 1, ease: "power3.out" })
    .from(blackLayerRef.current, { y: 100, opacity: 0, duration: 0.8, ease: "power2.out" }, "-=0.5")
    .from(darkPinkLayerRef.current, { y: 100, opacity: 0, duration: 0.8, ease: "power2.out" }, "-=0.6")
    .from(pinkSectionRef.current, { y: 100, scale: 0.95, opacity: 0, duration: 1, ease: "power4.out" }, "-=0.6")
    .from(characterRef.current, { y: 200, opacity: 0, duration: 0.8, ease: "back.out(1.7)" }, "-=0.6")
    .from(contentRef.current, { opacity: 0, duration: 0.8 }, "-=0.4");
  }, [loading]);

  if (loading) return <div className="h-screen flex items-center justify-center text-[#e7008a] font-black text-2xl animate-pulse">Loading SecureVault...</div>;

  return (
    <div className="min-h-screen w-full bg-[#f5f5dc] font-sans overflow-x-hidden flex flex-col relative">
      
      {/* --- Navbar --- */}
      <nav className="flex items-center justify-between px-6 md:px-8 py-4 max-w-[1800px] mx-auto w-full z-50 relative">
        <div className="text-xs font-bold text-gray-400 tracking-widest">V1.0</div> 
        
        <div className="hidden lg:flex gap-8 text-sm font-bold text-gray-500">
            {['Home', 'Ledger', 'Contact', 'About Us'].map(item => (
                <a key={item} href="#" className="hover:text-black transition-colors">{item}</a>
            ))}
        </div>

        <button className="lg:hidden text-black" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
             <Menu />
        </button>

        <button onClick={logout} className="hidden lg:flex items-center gap-2 bg-black text-white px-5 py-2 rounded-full hover:bg-gray-800 transition font-bold text-xs">
            <LogOut size={14} /> <span>LOGOUT</span>
        </button>
      </nav>

      {/* --- GIANT BACKGROUND TITLE --- */}
      <div className="w-full flex justify-center mt-2 mb-[-3vw] relative z-0 pointer-events-none">
          <h1 ref={titleRef} className="text-[14vw] font-black leading-none tracking-tighter text-black select-none opacity-90">
              SECUREVAULT
          </h1>
      </div>

      {/* --- Main Content Wrapper --- */}
      <div className="flex-1 px-4 md:px-8 pb-8 flex flex-col max-w-[1800px] mx-auto w-full relative z-10 mt-12 md:mt-16">
        
        {/* === CARD STACK CONTAINER === */}
        <div className="relative w-full min-h-[750px] lg:min-h-[600px] flex-1">
            
            {/* LAYER 1: Black Card (Always Black) */}
            <div ref={blackLayerRef} className="absolute top-0 left-1/2 -translate-x-1/2 w-[90%] h-full bg-[#111] rounded-[2.5rem] lg:rounded-[3.5rem] transform -translate-y-6 md:-translate-y-8 z-0"></div>
            
            {/* LAYER 2: Middle Card (Dynamic Color) */}
            <div 
                ref={darkPinkLayerRef} 
                className="absolute top-0 left-1/2 -translate-x-1/2 w-[95%] h-full rounded-[2.5rem] lg:rounded-[3.5rem] transform -translate-y-3 md:-translate-y-4 z-10 shadow-2xl transition-colors duration-500"
                style={{ backgroundColor: middleCardColor }}
            ></div>

            {/* LAYER 3: Main Card (Dynamic Color) */}
            <div 
                ref={pinkSectionRef} 
                className="relative w-full h-full rounded-[2.5rem] lg:rounded-[3.5rem] z-20 flex flex-col items-center px-6 md:px-16 pt-10 md:pt-20 pb-10 shadow-2xl transition-colors duration-500"
                style={{ backgroundColor: frontCardColor }}
            >
                
                {/* --- CHARACTER IMAGE --- */}
                <div 
                  ref={characterRef} 
                  className={`hidden md:flex absolute bottom-0 z-30 w-auto pointer-events-none items-end justify-center ${getCharacterStyles()}`}
                >
                    {isFrog ? (
                        <img src={FROG_IMAGE} alt="Frog Mascot" className="h-full w-auto object-contain drop-shadow-2xl"/>
                    ) : (
                        <img src={SHARK_IMAGE} alt="Shark Mascot" className="h-full w-auto object-contain drop-shadow-2xl"/>
                    )}
                </div>

                {/* --- CONTENT GRID --- */}
                <div ref={contentRef} className="w-full h-full flex flex-col lg:flex-row justify-between items-center lg:items-stretch relative z-40 gap-8 lg:gap-10">

                    {/* Text Section */}
                    <div className="w-full lg:w-1/3 flex flex-col  text-center lg:text-left z-50">
                        <span className="text-white/80 font-bold tracking-[0.2em] uppercase text-xs md:text-sm mb-3 md:mb-4">Financial Command Center</span>
                        <h2 className="text-4xl md:text-6xl lg:text-7xl font-black text-white leading-[0.9] tracking-tight">
                            WELCOME<br/>BACK,<br/><span className="text-black">{profile?.username}</span>
                        </h2>
                        
                    </div>

                    {/* Widgets Section */}
                    <div className="w-full lg:w-[31rem] flex flex-col gap-5 justify-center z-50 pb-8 lg:pb-0">
                        
                        {/* Stats Row */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1 bg-white p-5 rounded-[2rem] shadow-lg flex flex-col justify-between hover:scale-[1.02] transition-transform">
                                <div className="text-gray-400 text-[10px] font-black uppercase flex items-center gap-1"><Wallet size={12}/> Balance</div>
                                <div className="text-3xl font-black text-black tracking-tighter">₹{profile?.balance}</div>
                            </div>
                            <div className="flex-1 bg-black p-5 rounded-[2rem] shadow-lg flex flex-col justify-between text-white relative overflow-hidden group hover:scale-[1.02] transition-transform">
                                <div className="text-teal-400 text-[10px] font-black uppercase flex items-center gap-1"><ShieldCheck size={12}/>Aadhar/ ID (AES-256)</div>
                                <div className="text-sm font-mono font-bold tracking-widest z-10 break-all">{profile?.aadhaar_number}</div>
                                <CreditCard className="absolute -bottom-5 -right-5 text-gray-800 w-20 h-20 opacity-50" />
                            </div>
                        </div>

                        {/* Transfer Widget */}
                        <div className="bg-white p-6 rounded-[2.5rem] shadow-lg">
                            <h3 className="text-sm font-black text-black mb-3 flex items-center gap-2"><Send size={16} className="text-[#e7008a]"/> Quick Transfer</h3>
                            {msg.text && <div className={`mb-2 px-3 py-1 rounded-lg text-[10px] font-bold ${msg.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>{msg.text}</div>}
                            <form onSubmit={handleTransfer} className="flex flex-col sm:flex-row gap-2">
                                <select className="w-full sm:flex-[2] bg-gray-50 rounded-xl px-3 py-3 text-xs font-bold text-gray-700 outline-none focus:ring-2 focus:ring-[#e7008a]"
                                    value={transferData.receiver_username} onChange={(e) => setTransferData({...transferData, receiver_username: e.target.value})}>
                                    <option value="">Select User...</option>
                                    {users.map(u => <option key={u.username} value={u.username}>{u.username}</option>)}
                                </select>
                                <div className="flex gap-2 sm:flex-[1]">
                                    <input type="number" placeholder="₹" className="w-full bg-gray-50 rounded-xl p-3 text-xs font-bold text-gray-700 outline-none focus:ring-2 focus:ring-[#e7008a]"
                                        value={transferData.amount} onChange={(e) => setTransferData({...transferData, amount: e.target.value})} />
                                    <button type="submit" className="bg-[#e7008a] text-white px-4 rounded-xl font-black text-xs hover:bg-[#c50075] transition">PAY</button>
                                </div>
                            </form>
                        </div>

                        {/* Activity Widget */}
                        <div className="bg-white p-6 rounded-[2.5rem] shadow-lg h-[200px] flex flex-col">
                            <h3 className="text-sm font-black text-black mb-3 flex items-center gap-2"><History size={16} className="text-gray-400"/> Activity</h3>
                            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-2">
                                {transactions.length === 0 ? <p className="text-gray-300 font-bold text-center text-xs mt-4">No recent activity.</p> : 
                                    transactions.map(tx => {
                                        const isSender = tx.sender_name === profile?.username;
                                        return (
                                            <div key={tx.id} className="flex justify-between items-center p-2 bg-gray-50 rounded-xl">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-6 h-6 rounded flex items-center justify-center font-black text-[10px] ${isSender ? 'bg-red-100 text-red-600' : 'bg-teal-100 text-teal-600'}`}>{isSender ? '↑' : '↓'}</div>
                                                    <p className="font-bold text-xs text-gray-900">{isSender ? tx.receiver_name : tx.sender_name}</p>
                                                </div>
                                                <span className={`font-black text-xs ${isSender ? 'text-black' : 'text-teal-600'}`}>{isSender ? '-' : '+'}₹{tx.amount}</span>
                                            </div>
                                        )
                                    })
                                }
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;