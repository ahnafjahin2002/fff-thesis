import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { playAudio as playBanglaAudio } from '../utils/audio';
import { getUsers, createUser, loginUser } from '../utils/api';
// Import Generated Assets
import loginBg from '../assets/login/login-bg.png';
import loginMascot from '../assets/login/login-mascot.png';
import avatarBoyGreen from '../assets/login/avatar-boy-green.png';
import avatarGirlYellow from '../assets/login/avatar-girl-yellow.png';
import avatarBoyBlue from '../assets/login/avatar-boy-blue.png';
import avatarGirlHijab from '../assets/login/avatar-girl-hijab.png';

// Simple SVGs for icons
const BackSVG = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
);

const UserSVG = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#687076" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const LockSVG = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#687076" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0110 0v4" />
  </svg>
);

const SpeakerSVG = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
  </svg>
);

export default function LoginPage() {
  const navigate = useNavigate();
  
  // Views: "setup" -> "createChild" | "createParent" | "avatar" -> "pin"
  const [view, setView] = useState("avatar");
  
  // Student/User List State
  const [avatars, setAvatars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [pin, setPin] = useState("");
  
  // New Profile State
  const [newUserName, setNewUserName] = useState("");
  const [newUserAvatar, setNewUserAvatar] = useState("");
  const [newUserPin, setNewUserPin] = useState("");
  const [newUserRole, setNewUserRole] = useState("parent");
  const [newUserEmail, setNewUserEmail] = useState("");

  const avatarMap = {
    'avatar-boy-green': { img: avatarBoyGreen, bg: "#eef9f1", color: "#18b368" },
    'avatar-girl-yellow': { img: avatarGirlYellow, bg: "#fffbee", color: "#f5a623" },
    'avatar-boy-blue': { img: avatarBoyBlue, bg: "#e0f2fe", color: "#3b82f6" },
    'avatar-girl-hijab': { img: avatarGirlHijab, bg: "#fff0f5", color: "#f06292" },
    'avatar-1': { img: avatarBoyGreen, bg: "#eef9f1", color: "#18b368" }
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      let users = await getUsers();
      
      if (users.length === 0) {
        setView("setup");
        setAvatars([]);
      } else {
        const formattedAvatars = users.map(u => {
          if (u.role === 'child') {
            const style = avatarMap[u.avatar] || avatarMap['avatar-boy-green'];
            return {
              id: u._id,
              name: u.name,
              role: 'child',
              img: style.img,
              bg: style.bg,
              color: style.color,
              hasPin: u.hasPin || false
            };
          } else {
            return {
              id: u._id,
              name: u.name,
              role: u.role,
              img: null, // Render an emoji later
              bg: "#fff0f5",
              color: "#f06292",
              hasPin: false
            };
          }
        });
        setAvatars(formattedAvatars);
        setView("avatar");
      }
    } catch (err) {
      console.error("Failed to load users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const playAudio = (text) => {
    playBanglaAudio(text, { playbackRate: 0.85 });
  };

  const handleAvatarSelect = (avatar) => {
    setSelectedAvatar(avatar);
    if (avatar.role === 'child') {
      playAudio(`${avatar.name} নির্বাচিত হয়েছে`);
    }
  };

  const handleNumberPress = (num) => {
    if (pin.length < 4) {
      setPin(prev => prev + num);
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(400 + parseInt(num)*50, ctx.currentTime);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.1);
      } catch(e){}
    }
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
  };

  const handleNextToPin = () => {
    if (!selectedAvatar) {
      playAudio("তোমার ছবি বেছে নাও");
      return;
    }
    if (selectedAvatar.role === 'child') {
      setView("pin");
      playAudio("চারটি সংখ্যা চাপো");
    } else {
      // Direct login for parent/teacher
      localStorage.setItem('activeUserId', selectedAvatar.id);
      localStorage.setItem('activeUserName', selectedAvatar.name);
      localStorage.removeItem('activeUserAvatar'); // Clear avatar since it's an emoji
      navigate("/dashboard");
    }
  };

  const handleStudentLogin = async () => {
    // If child has a pin, check it via backend
    if (selectedAvatar.hasPin) {
      if (pin.length < 4) {
        playAudio("আবার চেষ্টা করি");
        return;
      }
      try {
        await loginUser(selectedAvatar.id, pin);
      } catch (err) {
        playAudio("ভুল পিন, আবার চেষ্টা করি");
        setPin("");
        return;
      }
    }
    
    // Save to localStorage
    if (selectedAvatar) {
      localStorage.setItem('activeUserId', selectedAvatar.id);
      localStorage.setItem('activeUserName', selectedAvatar.name);
      localStorage.setItem('activeUserAvatar', selectedAvatar.img);
    }
    
    playAudio("চলো শিখি!");
    setTimeout(() => {
      navigate("/dashboard");
    }, 1000);
  };

  // --- Creation Handlers ---

  const handleUseDemo = async () => {
    try {
      setLoading(true);
      const demoChild = await createUser({
        name: "Aarav",
        role: "child",
        avatar: "avatar-boy-green",
        pin: "1234"
      });
      localStorage.setItem('activeUserId', demoChild._id);
      localStorage.setItem('activeUserName', demoChild.name);
      localStorage.setItem('activeUserAvatar', avatarMap['avatar-boy-green'].img);
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleCreateChild = async (e) => {
    e.preventDefault();
    if (!newUserName || !newUserAvatar) {
      alert("নাম এবং ছবি বাছাই করুন");
      return;
    }
    try {
      setLoading(true);
      const child = await createUser({
        name: newUserName,
        role: "child",
        avatar: newUserAvatar,
        pin: newUserPin
      });
      localStorage.setItem('activeUserId', child._id);
      localStorage.setItem('activeUserName', child.name);
      localStorage.setItem('activeUserAvatar', avatarMap[child.avatar].img);
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleCreateParent = async (e) => {
    e.preventDefault();
    if (!newUserName) return;
    try {
      setLoading(true);
      const parent = await createUser({
        name: newUserName,
        role: newUserRole,
        email: newUserEmail
      });
      localStorage.setItem('activeUserId', parent._id);
      localStorage.setItem('activeUserName', parent.name);
      localStorage.removeItem('activeUserAvatar');
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div style={{
      width: '100%', minHeight: '100vh', background: '#f0faf4',
      backgroundImage: 'radial-gradient(#d4f3e3 1px, transparent 1px)',
      backgroundSize: '30px 30px', fontFamily: "'Hind Siliguri', sans-serif",
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
    }}>
      <style>{`
        * { box-sizing: border-box; }
        .login-card {
          width: 100%; max-width: 480px; background: #ffffff; border-radius: 36px;
          box-shadow: 0 16px 50px rgba(24,179,104,0.08); padding: 40px 32px;
          position: relative; overflow: hidden; border: 2px solid #eef9f1;
        }
        .numpad { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin: 24px 0; }
        .num-btn {
          height: 64px; border-radius: 20px; background: #fdfdfd; border: 2px solid #edf2f7;
          font-size: 28px; font-weight: 700; color: #4a5568; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.2s ease; user-select: none; box-shadow: 0 4px 0 #edf2f7;
        }
        .num-btn:active { transform: translateY(4px); box-shadow: 0 0 0 #edf2f7; background: #f1f5f9; }
        .input-group { margin-bottom: 20px; position: relative; }
        .input-icon { position: absolute; left: 16px; top: 50%; transform: translateY(-50%); display: flex; }
        .t-input {
          width: 100%; height: 60px; border-radius: 16px; border: 2px solid #e2e8f0;
          padding: 0 20px 0 52px; font-size: 17px; font-family: inherit; color: #1d2b2a;
          outline: none; transition: border-color 0.2s;
        }
        .t-input:focus { border-color: #18b368; }
        .action-btn {
          width: 100%; height: 64px; border-radius: 24px; border: none; font-size: 20px;
          font-weight: 700; cursor: pointer; transition: all 0.3s;
          display: flex; align-items: center; justify-content: center; gap: 8px;
        }
      `}</style>

      {/* Background Image */}
      <img src={loginBg} alt="" style={{
        position: 'fixed', inset: 0, width: '100%', height: '100%', 
        objectFit: 'cover', opacity: 0.22, pointerEvents: 'none', zIndex: 0
      }} />

      <AnimatePresence mode="wait">
        
        {/* =========================================
            SCREEN 0: FIRST-TIME SETUP
        ========================================= */}
        {view === "setup" && (
          <motion.div key="setup-view" className="login-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -30 }}>
            <div style={{ textAlign: 'center', marginBottom: 30 }}>
              <img src={loginMascot} alt="" style={{ width: 80, height: 'auto', marginBottom: 16 }} />
              <h1 style={{ fontSize: 28, fontWeight: 800, color: '#1d2b2a', margin: 0 }}>স্বাগতম!</h1>
              <p style={{ color: '#687076', fontSize: 16, marginTop: 8 }}>প্রোফাইল তৈরি করে শুরু করো</p>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <button className="action-btn" onClick={() => setView('createChild')} style={{ background: '#18b368', color: 'white', boxShadow: '0 8px 24px rgba(24,179,104,0.3)' }}>
                👶 শিশুর প্রোফাইল তৈরি করুন
              </button>
              <button className="action-btn" onClick={() => setView('createParent')} style={{ background: '#f5a623', color: 'white', boxShadow: '0 8px 24px rgba(245,166,35,0.3)' }}>
                👨‍🏫 অভিভাবক/শিক্ষক প্রোফাইল
              </button>
              <button className="action-btn" onClick={handleUseDemo} style={{ background: '#e2e8f0', color: '#4a5568', marginTop: 12 }}>
                🚀 ডেমো প্রোফাইল ব্যবহার করুন
              </button>
            </div>
          </motion.div>
        )}

        {/* =========================================
            SCREEN 0.1: CREATE CHILD PROFILE
        ========================================= */}
        {view === "createChild" && (
          <motion.div key="create-child-view" className="login-card" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
            <button onClick={() => setView(avatars.length ? "avatar" : "setup")} style={{ background: 'none', border: 'none', color: '#687076', fontSize: 16, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 24 }}>
              <BackSVG /> ফিরে যান
            </button>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: '#1d2b2a', marginBottom: 20 }}>শিশুর প্রোফাইল</h2>
            
            <form onSubmit={handleCreateChild}>
              <div className="input-group">
                <div className="input-icon"><UserSVG /></div>
                <input type="text" className="t-input" placeholder="শিশুর নাম" value={newUserName} onChange={e => setNewUserName(e.target.value)} required />
              </div>
              
              <p style={{ color: '#687076', fontSize: 15, marginBottom: 10, fontWeight: 600 }}>ছবি বাছাই করো:</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 20 }}>
                {Object.entries(avatarMap).filter(([k]) => k !== 'avatar-1').map(([key, style]) => (
                  <div key={key} onClick={() => setNewUserAvatar(key)} style={{
                    borderRadius: 16, padding: 8, cursor: 'pointer', background: style.bg,
                    border: `3px solid ${newUserAvatar === key ? style.color : 'transparent'}`,
                    opacity: newUserAvatar && newUserAvatar !== key ? 0.5 : 1
                  }}>
                    <img src={style.img} alt="" style={{ width: '100%', height: 'auto', borderRadius: '50%' }} />
                  </div>
                ))}
              </div>

              <div className="input-group" style={{ marginBottom: 32 }}>
                <div className="input-icon"><LockSVG /></div>
                <input type="text" className="t-input" placeholder="৪-সংখ্যার পিন (ঐচ্ছিক)" maxLength={4} value={newUserPin} onChange={e => setNewUserPin(e.target.value.replace(/\D/g, ''))} />
              </div>

              <button type="submit" className="action-btn" style={{ background: '#18b368', color: 'white' }}>
                {loading ? "তৈরি হচ্ছে..." : "প্রোফাইল সেভ করো"}
              </button>
            </form>
          </motion.div>
        )}

        {/* =========================================
            SCREEN 0.2: CREATE PARENT PROFILE
        ========================================= */}
        {view === "createParent" && (
          <motion.div key="create-parent-view" className="login-card" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
            <button onClick={() => setView(avatars.length ? "avatar" : "setup")} style={{ background: 'none', border: 'none', color: '#687076', fontSize: 16, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 24 }}>
              <BackSVG /> ফিরে যান
            </button>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: '#1d2b2a', marginBottom: 20 }}>অভিভাবক/শিক্ষক প্রোফাইল</h2>
            
            <form onSubmit={handleCreateParent}>
              <div className="input-group">
                <div className="input-icon"><UserSVG /></div>
                <input type="text" className="t-input" placeholder="নাম" value={newUserName} onChange={e => setNewUserName(e.target.value)} required />
              </div>
              
              <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 16 }}>
                  <input type="radio" name="role" value="parent" checked={newUserRole === 'parent'} onChange={e => setNewUserRole(e.target.value)} style={{ transform: 'scale(1.2)' }} /> অভিভাবক
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 16 }}>
                  <input type="radio" name="role" value="teacher" checked={newUserRole === 'teacher'} onChange={e => setNewUserRole(e.target.value)} style={{ transform: 'scale(1.2)' }} /> শিক্ষক
                </label>
              </div>

              <div className="input-group" style={{ marginBottom: 32 }}>
                <div className="input-icon"><LockSVG /></div>
                <input type="email" className="t-input" placeholder="ইমেইল (ঐচ্ছিক)" value={newUserEmail} onChange={e => setNewUserEmail(e.target.value)} />
              </div>

              <button type="submit" className="action-btn" style={{ background: '#f5a623', color: 'white' }}>
                {loading ? "তৈরি হচ্ছে..." : "লগইন তৈরি করুন"}
              </button>
            </form>
          </motion.div>
        )}

        {/* =========================================
            SCREEN 1: EXISTING PROFILES
        ========================================= */}
        {view === "avatar" && (
          <motion.div key="avatar-view" className="login-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 32 }}>
              <img src={loginMascot} alt="" style={{ width: 64, height: 'auto', objectFit: 'contain' }} />
              <h1 style={{ fontSize: 32, fontWeight: 800, color: '#1d2b2a', margin: 0 }}>তুমি কে?</h1>
              <button onClick={() => playAudio("তোমার ছবি বেছে নাও")} style={{ background: '#eef9f1', border: 'none', color: '#18b368', width: 44, height: 44, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <SpeakerSVG />
              </button>
            </div>
            
            <p style={{ textAlign: 'center', fontSize: 18, color: '#687076', marginBottom: 24, marginTop: -20 }}>
              প্রোফাইল বেছে নাও
            </p>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#18b368' }}>লোড হচ্ছে...</div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginBottom: 36, maxHeight: '300px', overflowY: 'auto' }}>
                {avatars.map(avatar => {
                  const isSelected = selectedAvatar?.id === avatar.id;
                  return (
                    <motion.div
                      key={avatar.id}
                      whileHover={{ y: -4 }} whileTap={{ scale: 0.95 }}
                      onClick={() => handleAvatarSelect(avatar)}
                      style={{
                        borderRadius: 24, background: avatar.bg,
                        border: `4px solid ${isSelected ? avatar.color : 'transparent'}`,
                        padding: '20px 10px', display: 'flex', flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                        boxShadow: isSelected ? `0 12px 24px ${avatar.color}30` : 'none',
                        transition: 'all 0.2s', opacity: selectedAvatar && !isSelected ? 0.6 : 1,
                        position: 'relative', overflow: 'hidden'
                      }}
                    >
                      {avatar.img ? (
                        <img src={avatar.img} alt={avatar.name} style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', marginBottom: 8, border: `3px solid white` }} />
                      ) : (
                        <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, marginBottom: 8 }}>
                          {avatar.role === 'teacher' ? '👨‍🏫' : '👨‍👩‍👧'}
                        </div>
                      )}
                      <div style={{ fontSize: 18, fontWeight: 700, color: '#1d2b2a' }}>{avatar.name}</div>
                      <div style={{ fontSize: 12, color: '#687076' }}>
                        {avatar.role === 'child' ? 'শিশু' : avatar.role === 'teacher' ? 'শিক্ষক' : 'অভিভাবক'}
                      </div>
                      {isSelected && (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ position: 'absolute', top: -10, right: -10, background: avatar.color, color: 'white', width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, border: '3px solid white' }}>✓</motion.div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            )}

            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleNextToPin} style={{ width: '100%', height: 64, borderRadius: 24, background: selectedAvatar ? '#18b368' : '#e2e8f0', color: selectedAvatar ? 'white' : '#94a3b8', border: 'none', fontSize: 22, fontWeight: 700, cursor: selectedAvatar ? 'pointer' : 'not-allowed', boxShadow: selectedAvatar ? '0 8px 24px rgba(24,179,104,0.3)' : 'none', transition: 'all 0.3s' }}>
              এগিয়ে যাও
            </motion.button>

            <div style={{ textAlign: 'center', marginTop: 28, display: 'flex', justifyContent: 'center', gap: 16 }}>
              <button onClick={() => { setNewUserRole("child"); setView("createChild"); }} style={{ background: 'none', border: 'none', color: '#18b368', fontSize: 15, fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}>
                + নতুন শিশু প্রোফাইল
              </button>
              <button onClick={() => { setNewUserRole("parent"); setView("createParent"); }} style={{ background: 'none', border: 'none', color: '#f5a623', fontSize: 15, fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}>
                + অভিভাবক প্রোফাইল
              </button>
            </div>
          </motion.div>
        )}

        {/* =========================================
            SCREEN 2: PIN ENTRY
        ========================================= */}
        {view === "pin" && (
          <motion.div key="pin-view" className="login-card" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }}>
            <button onClick={() => { setView("avatar"); setPin(""); }} style={{ position: 'absolute', top: 24, left: 24, background: '#f8f9fa', border: 'none', width: 44, height: 44, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#1d2b2a' }}>
              <BackSVG />
            </button>

            <div style={{ textAlign: 'center', marginBottom: 20, marginTop: 8 }}>
              <div style={{ width: 90, height: 90, borderRadius: '50%', background: selectedAvatar?.bg, border: `4px solid ${selectedAvatar?.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', overflow: 'hidden' }}>
                <img src={selectedAvatar?.img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                <LockSVG />
                <h2 style={{ fontSize: 24, fontWeight: 800, color: '#1d2b2a', margin: 0 }}>৪টি সংখ্যা দাও</h2>
                <button onClick={() => playAudio("চারটি সংখ্যা চাপো")} style={{ background: '#eef9f1', border: 'none', color: '#18b368', width: 36, height: 36, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <SpeakerSVG />
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: 16, margin: '24px 0' }}>
              {[0, 1, 2, 3].map(i => (
                <motion.div key={i} animate={{ scale: i < pin.length ? [1, 1.2, 1] : 1 }} transition={{ duration: 0.2 }} style={{ width: 24, height: 24, borderRadius: '50%', background: i < pin.length ? '#18b368' : '#e2e8f0', border: i < pin.length ? 'none' : '2px solid #cbd5e1' }} />
              ))}
            </div>

            <div className="numpad">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                <div key={num} className="num-btn" onClick={() => handleNumberPress(num.toString())}>{num}</div>
              ))}
              <div className="num-btn" style={{ background: '#fff0f5', color: '#f06292', borderColor: '#fbcfe8' }} onClick={handleDelete}><span style={{ fontSize: 28 }}>⌫</span></div>
              <div className="num-btn" onClick={() => handleNumberPress("0")}>0</div>
              <div className="num-btn" style={{ background: '#eef9f1', color: '#18b368', borderColor: '#bbf7d0' }} onClick={handleStudentLogin}><span style={{ fontSize: 28 }}>✓</span></div>
            </div>

            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleStudentLogin} style={{ width: '100%', height: 64, borderRadius: 24, background: pin.length === 4 ? '#18b368' : '#e2e8f0', color: pin.length === 4 ? 'white' : '#94a3b8', border: 'none', fontSize: 22, fontWeight: 700, cursor: pin.length === 4 ? 'pointer' : 'not-allowed', boxShadow: pin.length === 4 ? '0 8px 24px rgba(24,179,104,0.3)' : 'none', transition: 'all 0.3s' }}>
              প্রবেশ করো
            </motion.button>
            
            <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: 14, marginTop: 16 }}>
              PIN ভুলে গেলে শিক্ষক/অভিভাবককে বলো
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
