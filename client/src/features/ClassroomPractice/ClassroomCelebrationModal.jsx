import React from 'react';
import { motion } from 'framer-motion';

const toBanglaNum = (num) => {
  if (num === undefined || num === null) return '--';
  return String(num).replace(/[0-9]/g, (d) => '০১২৩৪৫৬৭৮৯'[d]);
};

export default function ClassroomCelebrationModal({ student, stats, onNextStudent, onReturnToWorkspace }) {
  if (!student) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(15, 23, 42, 0.94)',
        backdropFilter: 'blur(10px)',
        zIndex: 999999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        style={{
          background: 'linear-gradient(135deg, #065f46 0%, #047857 100%)',
          border: '3px solid #34d399',
          borderRadius: 24,
          maxWidth: 640,
          width: '90%',
          padding: 32,
          color: '#ffffff',
          textAlign: 'center',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.7)',
        }}
      >
        <div style={{ fontSize: 64, marginBottom: 10 }}>🎉</div>

        <h2 style={{ fontSize: 28, fontWeight: 900, margin: 0, color: '#ffffff' }}>
          সাবাশ, {student.name}!
        </h2>

        <div style={{ fontSize: 16, opacity: 0.9, marginTop: 6 }}>
          আজকের ক্লাসরুম অনুশীলন সফলভাবে সম্পন্ন হয়েছে!
        </div>

        {/* Celebration Badges */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 16, margin: '24px 0' }}>
          <div style={{ background: 'rgba(255, 255, 255, 0.2)', padding: '12px 20px', borderRadius: 16 }}>
            <div style={{ fontSize: 13, opacity: 0.9 }}>অর্জিত তারা</div>
            <div style={{ fontSize: 24, fontWeight: 800 }}>🌟 {toBanglaNum(stats?.stars || 3)}টি</div>
          </div>
          <div style={{ background: 'rgba(255, 255, 255, 0.2)', padding: '12px 20px', borderRadius: 16 }}>
            <div style={{ fontSize: 13, opacity: 0.9 }}>সঠিকতা</div>
            <div style={{ fontSize: 24, fontWeight: 800 }}>🎯 {toBanglaNum(stats?.accuracy || 100)}%</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 10 }}>
          <button
            onClick={onNextStudent}
            style={{
              background: '#ffffff',
              color: '#065f46',
              border: 'none',
              borderRadius: 14,
              padding: '16px 24px',
              fontSize: 17,
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
            }}
          >
            <span>⏭️</span>
            <span>পরবর্তী শিক্ষার্থী নির্বাচন করুন (Next Turn)</span>
          </button>

          <button
            onClick={onReturnToWorkspace}
            style={{
              background: 'rgba(0, 0, 0, 0.25)',
              color: '#ffffff',
              border: '1px solid rgba(255, 255, 255, 0.4)',
              borderRadius: 12,
              padding: '12px 20px',
              fontSize: 14,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            📊 ড্যাশবোর্ডে ফিরে যান (Return to Workspace)
          </button>
        </div>
      </motion.div>
    </div>
  );
}
