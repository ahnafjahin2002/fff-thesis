import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useClassroom } from '../context/ClassroomContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function ClassroomHUD() {
  const {
    isClassroomMode,
    classroomActivityTitle,
    remainingPool,
    completedPool,
    activeClassroomStudent,
    pickNextRandomStudent,
    endClassroomSession,
  } = useClassroom();
  const navigate = useNavigate();

  if (!isClassroomMode) return null;

  const handleExit = () => {
    endClassroomSession();
    navigate('/teacher-workspace');
  };

  return (
    <motion.div
      initial={{ y: -100, opacity: 0, scale: 0.95 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      exit={{ y: -100, opacity: 0, scale: 0.95 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      style={{
        position: 'fixed',
        top: 24,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 20,
        padding: '10px 16px',
        background: 'rgba(15, 23, 42, 0.75)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        borderRadius: 40,
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.05) inset',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        color: '#ffffff',
        fontFamily: "'Inter', 'Outfit', sans-serif",
        minWidth: '650px',
        maxWidth: '92vw',
      }}
    >
      {/* ── Left: Mode Badge & Activity ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div
          style={{
            background: 'rgba(56, 189, 248, 0.15)',
            color: '#38bdf8',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            padding: '6px 12px',
            borderRadius: 20,
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: 0.5,
            textTransform: 'uppercase',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <span style={{ fontSize: 14 }}>🎯</span>
          <span>Classroom</span>
        </div>
        <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.15)' }} />
        <div style={{ fontSize: 15, fontWeight: 600, color: '#f1f5f9', whiteSpace: 'nowrap' }}>
          {classroomActivityTitle}
        </div>
      </div>

      {/* ── Center: Active Student ── */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
        <AnimatePresence mode="wait">
          {activeClassroomStudent ? (
            <motion.div
              key={activeClassroomStudent.id}
              initial={{ scale: 0.9, opacity: 0, y: 5 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: -5 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                background: 'rgba(255, 255, 255, 0.06)',
                padding: '6px 20px',
                borderRadius: 24,
                border: '1px solid rgba(255, 255, 255, 0.08)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              }}
            >
              <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginRight: 4 }}>
                Active:
              </span>
              <span style={{ fontSize: 20 }}>{activeClassroomStudent.avatar || '👦'}</span>
              <span style={{ fontSize: 16, fontWeight: 700, color: '#38bdf8' }}>
                {activeClassroomStudent.name}
              </span>
            </motion.div>
          ) : (
            <motion.div
              key="none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 20px',
                borderRadius: 24,
                background: 'rgba(0,0,0,0.2)',
                border: '1px dashed rgba(255,255,255,0.15)',
              }}
            >
              <span style={{ fontSize: 13, color: '#cbd5e1', fontWeight: 500 }}>
                Waiting for student...
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Right: Controls ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {remainingPool.length > 0 ? (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={pickNextRandomStudent}
            style={{
              background: '#0ea5e9',
              color: '#ffffff',
              border: 'none',
              padding: '8px 16px',
              borderRadius: 24,
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: '0 4px 12px rgba(14, 165, 233, 0.3)',
            }}
          >
            <span style={{ fontSize: 16 }}>🎲</span>
            <span>Pick Next ({remainingPool.length})</span>
          </motion.button>
        ) : (
          <div
            style={{
              background: 'rgba(245, 158, 11, 0.15)',
              color: '#fbbf24',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              padding: '8px 16px',
              borderRadius: 24,
              fontSize: 12,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <span>🏆</span>
            <span>All Done!</span>
          </div>
        )}

        <motion.button
          whileHover={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171' }}
          whileTap={{ scale: 0.95 }}
          onClick={handleExit}
          style={{
            background: 'transparent',
            color: '#94a3b8',
            border: 'none',
            padding: '8px',
            width: 36,
            height: 36,
            borderRadius: '50%',
            fontSize: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          title="Exit Classroom Mode"
        >
          ✕
        </motion.button>
      </div>
    </motion.div>
  );
}
