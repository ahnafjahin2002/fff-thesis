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
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -80, opacity: 0 }}
      style={{
        position: 'fixed',
        top: 14,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 24,
        padding: '10px 24px',
        background: 'rgba(15, 23, 42, 0.94)',
        border: '1px solid rgba(255, 255, 255, 0.16)',
        borderRadius: 999,
        boxShadow: '0 12px 36px rgba(0, 0, 0, 0.45)',
        backdropFilter: 'blur(16px)',
        color: '#ffffff',
        fontFamily: "'Outfit', 'Baloo Da 2', sans-serif",
        maxWidth: '92vw',
      }}
    >
      {/* Left: Mode Badge & Activity Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div
          style={{
            background: 'rgba(16, 185, 129, 0.2)',
            color: '#34d399',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            padding: '4px 12px',
            borderRadius: 999,
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: 0.8,
            textTransform: 'uppercase',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <span>🖥️</span>
          <span>Classroom Mode</span>
        </div>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#e2e8f0', whiteSpace: 'nowrap' }}>
          {classroomActivityTitle}
        </div>
      </div>

      {/* Center: Currently Selected Student */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          background: 'rgba(255, 255, 255, 0.08)',
          padding: '6px 18px',
          borderRadius: 999,
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <span style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
          Active Student:
        </span>
        <AnimatePresence mode="wait">
          {activeClassroomStudent ? (
            <motion.div
              key={activeClassroomStudent.id}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              style={{ display: 'flex', alignItems: 'center', gap: 8 }}
            >
              <span style={{ fontSize: 22 }}>{activeClassroomStudent.avatar || '👦'}</span>
              <span style={{ fontSize: 16, fontWeight: 700, color: '#38bdf8' }}>
                {activeClassroomStudent.name}
              </span>
              <span style={{ fontSize: 15, color: '#cbd5e1' }}>
                ({activeClassroomStudent.nameBangla})
              </span>
            </motion.div>
          ) : (
            <motion.span
              key="none"
              style={{ fontSize: 14, color: '#94a3b8', fontStyle: 'italic' }}
            >
              Click &apos;Pick Next&apos; to select a student
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Right: Projector Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {remainingPool.length > 0 ? (
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={pickNextRandomStudent}
            style={{
              background: 'linear-gradient(135deg, #10b981, #059669)',
              color: '#ffffff',
              border: 'none',
              padding: '8px 18px',
              borderRadius: 999,
              fontSize: 14,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)',
            }}
          >
            <span>🎲</span>
            <span>Pick Next ({remainingPool.length} left)</span>
          </motion.button>
        ) : (
          <div
            style={{
              background: 'rgba(245, 158, 11, 0.2)',
              color: '#fbbf24',
              border: '1px solid rgba(245, 158, 11, 0.4)',
              padding: '8px 16px',
              borderRadius: 999,
              fontSize: 13,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <span>🏆</span>
            <span>All Students Participated!</span>
          </div>
        )}

        <button
          onClick={handleExit}
          style={{
            background: 'rgba(239, 68, 68, 0.2)',
            color: '#f87171',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            padding: '8px 14px',
            borderRadius: 999,
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          title="Exit Classroom Mode"
        >
          ✕ Exit
        </button>
      </div>
    </motion.div>
  );
}
