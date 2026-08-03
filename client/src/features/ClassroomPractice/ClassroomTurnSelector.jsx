import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useClassroom } from '../../context/ClassroomContext';

const toBanglaNum = (num) => {
  if (num === undefined || num === null) return '--';
  return String(num).replace(/[0-9]/g, (d) => '০১২৩৪৫৬৭৮৯'[d]);
};

export default function ClassroomTurnSelector({ roster, onLaunchActivity, onClose }) {
  const {
    remainingPool,
    completedPool,
    activeClassroomStudent,
    selectActiveStudent,
    pickNextRandomStudent,
    markStudentCompleted,
    skipStudentTurn,
    resetRoundPool,
  } = useClassroom();

  const [isSpinning, setIsSpinning] = useState(false);
  const [highlightedStudent, setHighlightedStudent] = useState(null);
  const [selectedActivity, setSelectedActivity] = useState('Reading Story');

  const totalStudents = roster.length;
  const completedCount = completedPool.length;
  const remainingCount = remainingPool.length;

  // Spin wheel / random pick animation
  const handleRandomPick = () => {
    if (remainingPool.length === 0) return;

    setIsSpinning(true);
    let counter = 0;
    const maxTicks = 24;
    const interval = setInterval(() => {
      const randomIdx = Math.floor(Math.random() * remainingPool.length);
      setHighlightedStudent(remainingPool[randomIdx]);
      counter++;

      if (counter >= maxTicks) {
        clearInterval(interval);
        setIsSpinning(false);
        const picked = pickNextRandomStudent();
        if (picked) {
          setHighlightedStudent(picked);
        }
      }
    }, 100);
  };

  const handleManualSelect = (student) => {
    selectActiveStudent(student);
    setHighlightedStudent(student);
  };

  const handleStartPractice = (activityName) => {
    const studentToUse = activeClassroomStudent || highlightedStudent || remainingPool[0];
    if (!studentToUse) return;
    selectActiveStudent(studentToUse);
    onLaunchActivity(activityName || selectedActivity);
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(15, 23, 42, 0.92)',
        backdropFilter: 'blur(8px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          border: '2px solid #38bdf8',
          borderRadius: 24,
          maxWidth: 960,
          width: '95%',
          maxHeight: '92vh',
          overflowY: 'auto',
          color: '#ffffff',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)',
          padding: 28,
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 800, margin: 0, color: '#38bdf8', display: 'flex', alignItems: 'center', gap: 10 }}>
              <span>📽️</span> <span>ক্লাসরুম অনুশীলন • শিক্ষার্থী নির্বাচন চাকা</span>
            </h2>
            <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>
              ১ ল্যাপটপ ১ প্রজেক্টর ক্লাসরুমের জন্য সেশন ম্যানেজমেন্ট
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: '#334155',
              color: '#f8fafc',
              border: 'none',
              borderRadius: 12,
              padding: '8px 16px',
              fontSize: 14,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            ✕ ড্যাশবোর্ডে ফিরে যান
          </button>
        </div>

        {/* Classroom Progress Bar */}
        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 16, padding: '16px 20px', marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#cbd5e1' }}>
              আজকের অংশগ্রহণ অগ্রগতি: {toBanglaNum(completedCount)} / {toBanglaNum(totalStudents)} জন সম্পন্ন
            </span>
            <span style={{ fontSize: 13, fontWeight: 800, color: remainingCount === 0 ? '#4ade80' : '#f59e0b' }}>
              {remainingCount === 0 ? '🎉 সবার অনুশীলন সম্পন্ন!' : `${toBanglaNum(remainingCount)} জন বাকি`}
            </span>
          </div>
          <div style={{ width: '100%', height: 12, background: '#0f172a', borderRadius: 6, overflow: 'hidden' }}>
            <div
              style={{
                width: `${totalStudents > 0 ? (completedCount / totalStudents) * 100 : 0}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #10b981 0%, #34d399 100%)',
                borderRadius: 6,
                transition: 'width 0.3s ease',
              }}
            />
          </div>
        </div>

        {/* Main Turn Selection Area */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
          
          {/* Left Column: Spin Wheel / Active Student Display */}
          <div
            style={{
              background: '#0f172a',
              border: '2px dashed #0284c7',
              borderRadius: 20,
              padding: 24,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 700, color: '#38bdf8', marginBottom: 12 }}>
              আজকের সক্রিয় শিক্ষার্থী (Active Student)
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={(activeClassroomStudent || highlightedStudent)?.id || 'empty'}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
              >
                <div
                  style={{
                    width: 100,
                    height: 100,
                    borderRadius: '50%',
                    background: '#1e293b',
                    border: '3px solid #38bdf8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 48,
                    marginBottom: 12,
                    overflow: 'hidden',
                    boxShadow: isSpinning ? '0 0 25px rgba(56, 189, 248, 0.8)' : '0 4px 12px rgba(0,0,0,0.4)',
                  }}
                >
                  {(activeClassroomStudent || highlightedStudent)?.avatar &&
                  ((activeClassroomStudent || highlightedStudent).avatar.startsWith('data:image') ||
                    (activeClassroomStudent || highlightedStudent).avatar.startsWith('http')) ? (
                    <img
                      src={(activeClassroomStudent || highlightedStudent).avatar}
                      alt="Student"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    (activeClassroomStudent || highlightedStudent)?.avatar || '👦'
                  )}
                </div>

                <div style={{ fontSize: 22, fontWeight: 800, color: '#ffffff' }}>
                  {(activeClassroomStudent || highlightedStudent)?.name || 'শিক্ষার্থী নির্বাচন করুন'}
                </div>
                <div style={{ fontSize: 14, color: '#94a3b8', marginTop: 2 }}>
                  {(activeClassroomStudent || highlightedStudent)?.classGrade || 'প্রথম শ্রেণী'}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Random Pick Button */}
            <button
              onClick={handleRandomPick}
              disabled={isSpinning || remainingCount === 0}
              style={{
                marginTop: 20,
                width: '100%',
                background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: 14,
                padding: '14px 20px',
                fontSize: 16,
                fontWeight: 800,
                cursor: remainingCount === 0 ? 'not-allowed' : 'pointer',
                opacity: remainingCount === 0 ? 0.5 : 1,
                boxShadow: '0 4px 16px rgba(3, 105, 161, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
              }}
            >
              <span>🎲</span>
              <span>{isSpinning ? 'নির্বাচন করা হচ্ছে...' : 'এলোমেলোভাবে শিক্ষার্থী নির্বাচন করুন'}</span>
            </button>

            {remainingCount === 0 && (
              <button
                onClick={() => resetRoundPool(roster)}
                style={{
                  marginTop: 12,
                  background: '#15803d',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 12,
                  padding: '10px 16px',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                🔄 নতুন রাউন্ড শুরু করুন (Start New Round)
              </button>
            )}
          </div>

          {/* Right Column: Activity Launcher */}
          <div style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 20, padding: 24 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#38bdf8', marginBottom: 14 }}>
              প্র্যাকটিস অ্যাক্টিভিটি বেছে নিন (Select Activity)
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: 18, maxHeight: 220, overflowY: 'auto' }}>
              <button
                type="button"
                onClick={() => setSelectedActivity('Reading Story')}
                style={{
                  background: selectedActivity === 'Reading Story' ? '#0369a1' : '#1e293b',
                  border: selectedActivity === 'Reading Story' ? '2px solid #38bdf8' : '1px solid #334155',
                  borderRadius: 14,
                  padding: '12px 14px',
                  textAlign: 'left',
                  color: '#ffffff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                }}
              >
                <span style={{ fontSize: 24 }}>📖</span>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 800 }}>গল্প পড়া</div>
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>Reading Story</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedActivity('BornoBazar')}
                style={{
                  background: selectedActivity === 'BornoBazar' ? '#0369a1' : '#1e293b',
                  border: selectedActivity === 'BornoBazar' ? '2px solid #38bdf8' : '1px solid #334155',
                  borderRadius: 14,
                  padding: '12px 14px',
                  textAlign: 'left',
                  color: '#ffffff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                }}
              >
                <span style={{ fontSize: 24 }}>🏪</span>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 800 }}>বর্ণবাজার</div>
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>BornoBazar</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedActivity('Quiz Game')}
                style={{
                  background: selectedActivity === 'Quiz Game' ? '#0369a1' : '#1e293b',
                  border: selectedActivity === 'Quiz Game' ? '2px solid #38bdf8' : '1px solid #334155',
                  borderRadius: 14,
                  padding: '12px 14px',
                  textAlign: 'left',
                  color: '#ffffff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                }}
              >
                <span style={{ fontSize: 24 }}>🧩</span>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 800 }}>মজার কুইজ</div>
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>Quiz Game</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedActivity('Word Practice')}
                style={{
                  background: selectedActivity === 'Word Practice' ? '#0369a1' : '#1e293b',
                  border: selectedActivity === 'Word Practice' ? '2px solid #38bdf8' : '1px solid #334155',
                  borderRadius: 14,
                  padding: '12px 14px',
                  textAlign: 'left',
                  color: '#ffffff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                }}
              >
                <span style={{ fontSize: 24 }}>✏️</span>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 800 }}>শব্দ অনুশীলন</div>
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>Word Practice</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedActivity('Sentence Builder')}
                style={{
                  background: selectedActivity === 'Sentence Builder' ? '#0369a1' : '#1e293b',
                  border: selectedActivity === 'Sentence Builder' ? '2px solid #38bdf8' : '1px solid #334155',
                  borderRadius: 14,
                  padding: '12px 14px',
                  textAlign: 'left',
                  color: '#ffffff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                }}
              >
                <span style={{ fontSize: 24 }}>📝</span>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 800 }}>বাক্য তৈরি</div>
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>Sentence Builder</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedActivity('Custom Reading')}
                style={{
                  background: selectedActivity === 'Custom Reading' ? '#0369a1' : '#1e293b',
                  border: selectedActivity === 'Custom Reading' ? '2px solid #38bdf8' : '1px solid #334155',
                  borderRadius: 14,
                  padding: '12px 14px',
                  textAlign: 'left',
                  color: '#ffffff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                }}
              >
                <span style={{ fontSize: 24 }}>🎯</span>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 800 }}>কাস্টম পড়া</div>
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>Custom Reading</div>
                </div>
              </button>
            </div>

            <button
              onClick={() => handleStartPractice(selectedActivity)}
              disabled={!(activeClassroomStudent || highlightedStudent || remainingPool[0])}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: 14,
                padding: '16px 20px',
                fontSize: 16,
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(16, 185, 129, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
              }}
            >
              <span>▶</span>
              <span>
                {(activeClassroomStudent || highlightedStudent)?.name || 'শিক্ষার্থী'}-এর সাথে অ্যাক্টিভিটি শুরু করুন
              </span>
            </button>
          </div>
        </div>

        {/* Bottom Unpracticed Roster Grid for Manual Selection */}
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#94a3b8', marginBottom: 12 }}>
            অপেক্ষমাণ শিক্ষার্থীদের তালিকা (ম্যানুয়ালি বেছে নিতে ডাবল ক্লিক করুন)
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 10, maxHeight: 180, overflowY: 'auto' }}>
            {remainingPool.map((student) => {
              const isSelected = (activeClassroomStudent || highlightedStudent)?.id === student.id;
              return (
                <button
                  key={student.id}
                  onClick={() => handleManualSelect(student)}
                  style={{
                    background: isSelected ? '#0369a1' : '#1e293b',
                    border: isSelected ? '2px solid #38bdf8' : '1px solid #334155',
                    borderRadius: 12,
                    padding: '10px 8px',
                    textAlign: 'center',
                    color: '#fff',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <div style={{ fontSize: 24 }}>{student.avatar || '👦'}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%' }}>
                    {student.name}
                  </div>
                  <span style={{ fontSize: 10, color: '#94a3b8' }}>অপেক্ষা করছে</span>
                </button>
              );
            })}
            {remainingPool.length === 0 && (
              <div style={{ gridColumn: '1 / -1', padding: 20, textAlign: 'center', color: '#4ade80', fontSize: 14 }}>
                🎉 সকল শিক্ষার্থীর ক্লাসরুম অনুশীলন সম্পন্ন হয়েছে!
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
