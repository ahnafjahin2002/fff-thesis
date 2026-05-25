/**
 * PreferencesPanel.jsx
 * ---------------------
 * Sliding right-side panel for all Adaptive Text Visualization settings.
 *
 * DESIGN DECISIONS (from thesis + documentation):
 *  - Slides in from right → never covers reading content on left
 *  - All changes take effect INSTANTLY (CSS vars update in real-time)
 *  - Uses 0.2s transitions so adjustments feel smooth, not jarring
 *  - All labels in Bangla (the learner's language)
 *  - Large touch targets (min 48px) for children with motor coordination issues
 *  - Organized into clear sections: Typography → Colors → Bangla Features
 *
 * SECTIONS:
 *   1. Font Family
 *   2. Font Size slider
 *   3. Line Height slider
 *   4. Letter Spacing slider
 *   5. Word Spacing slider
 *   6. Background Color swatches
 *   7. Text Color selector
 *   8. Column Width slider
 *   9. Paragraph Break mode
 *  10. Bangla-specific feature toggles
 *  11. Reset to defaults button
 */

import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import usePreferences from '../../hooks/usePreferences';
import {
  FONT_FAMILIES,
  COLOR_THEMES,
  TEXT_COLORS,
  DEFAULT_PREFERENCES,
} from '../../store/preferencesStore';

// ── Reusable sub-components ─────────────────────────────────────────────────

function SectionHeader({ children }) {
  return (
    <h3
      style={{
        fontFamily:    '"Noto Sans Bengali", sans-serif',
        fontSize:      '12px',
        fontWeight:    600,
        color:         '#E06B2E',
        letterSpacing: '0.8px',
        textTransform: 'uppercase',
        margin:        '20px 0 10px 0',
        paddingBottom: '6px',
        borderBottom:  '1px solid #E2D5C3',
      }}
    >
      {children}
    </h3>
  );
}

function SliderRow({ label, value, min, max, step = 1, unit = '', onChange, displayValue }) {
  return (
    <div style={{ marginBottom: '14px' }}>
      <div
        style={{
          display:        'flex',
          justifyContent: 'space-between',
          alignItems:     'center',
          marginBottom:   '6px',
        }}
      >
        <label
          style={{
            fontFamily: '"Noto Sans Bengali", sans-serif',
            fontSize:   '14px',
            color:      '#2D1B00',
          }}
        >
          {label}
        </label>
        <span
          style={{
            fontFamily:  '"Atkinson Hyperlegible", sans-serif',
            fontSize:    '13px',
            fontWeight:  600,
            color:       '#E06B2E',
            background:  '#FFF0E0',
            padding:     '2px 8px',
            borderRadius: '12px',
          }}
        >
          {displayValue || `${value}${unit}`}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={label}
        style={{ width: '100%' }}
      />
    </div>
  );
}

function Toggle({ label, checked, onChange, description }) {
  return (
    <div
      style={{
        display:        'flex',
        justifyContent: 'space-between',
        alignItems:     'flex-start',
        marginBottom:   '12px',
        gap:            '12px',
      }}
    >
      <div style={{ flex: 1 }}>
        <span
          style={{
            fontFamily: '"Noto Sans Bengali", sans-serif',
            fontSize:   '14px',
            color:      '#2D1B00',
            display:    'block',
          }}
        >
          {label}
        </span>
        {description && (
          <span
            style={{
              fontFamily: '"Noto Sans Bengali", sans-serif',
              fontSize:   '11px',
              color:      'rgba(45,27,0,0.5)',
              display:    'block',
              marginTop:  '2px',
            }}
          >
            {description}
          </span>
        )}
      </div>
      {/* Custom toggle switch */}
      <button
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        style={{
          flexShrink:    0,
          width:         '46px',
          height:        '26px',
          borderRadius:  '13px',
          border:        'none',
          background:    checked ? '#E06B2E' : '#E2D5C3',
          cursor:        'pointer',
          position:      'relative',
          transition:    'background 0.2s ease',
          minWidth:      '46px',
          minHeight:     '26px',
        }}
      >
        <span
          style={{
            position:   'absolute',
            top:        '3px',
            left:       checked ? '23px' : '3px',
            width:      '20px',
            height:     '20px',
            borderRadius: '50%',
            background: '#FFFFFF',
            boxShadow:  '0 1px 4px rgba(0,0,0,0.2)',
            transition: 'left 0.2s ease',
          }}
        />
      </button>
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────────────────────

export default function PreferencesPanel() {
  const { preferences, isPanelOpen, update, reset, closePanel } = usePreferences();
  const panelRef = useRef(null);

  // Close panel on outside click
  useEffect(() => {
    if (!isPanelOpen) return;
    function handleOutside(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        closePanel();
      }
    }
    // Slight delay to avoid immediate close on the toggle button click
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleOutside);
    }, 100);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleOutside);
    };
  }, [isPanelOpen, closePanel]);

  // Close on Escape
  useEffect(() => {
    if (!isPanelOpen) return;
    function handleKey(e) {
      if (e.key === 'Escape') closePanel();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isPanelOpen, closePanel]);

  return (
    <>
      {/* ── Backdrop overlay ── */}
      <AnimatePresence>
        {isPanelOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closePanel}
            style={{
              position:   'fixed',
              inset:      0,
              background: 'rgba(45,27,0,0.25)',
              zIndex:     40,
              backdropFilter: 'blur(2px)',
            }}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* ── Panel ── */}
      <AnimatePresence>
        {isPanelOpen && (
          <motion.aside
            ref={panelRef}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 260 }}
            style={{
              position:   'fixed',
              top:        0,
              right:      0,
              height:     '100vh',
              width:      'min(340px, 92vw)',
              background: '#FFFAF2',
              boxShadow:  '-4px 0 32px rgba(0,0,0,0.12)',
              zIndex:     50,
              overflowY:  'auto',
              display:    'flex',
              flexDirection: 'column',
            }}
            role="dialog"
            aria-label="পড়ার সেটিংস"
            aria-modal="true"
          >
            {/* ── Header ── */}
            <div
              style={{
                display:      'flex',
                alignItems:   'center',
                justifyContent: 'space-between',
                padding:      '18px 20px 14px',
                borderBottom: '2px solid #E2D5C3',
                position:     'sticky',
                top:          0,
                background:   '#FFFAF2',
                zIndex:       1,
              }}
            >
              <div>
                <h2
                  style={{
                    fontFamily: '"Noto Sans Bengali", sans-serif',
                    fontSize:   '18px',
                    fontWeight: 700,
                    color:      '#2D1B00',
                    margin:     0,
                  }}
                >
                  ⚙️ পড়ার সেটিংস
                </h2>
                <p
                  style={{
                    fontFamily: '"Noto Sans Bengali", sans-serif',
                    fontSize:   '12px',
                    color:      'rgba(45,27,0,0.5)',
                    margin:     '2px 0 0',
                  }}
                >
                  পরিবর্তন তাৎক্ষণিক হবে
                </p>
              </div>
              <button
                onClick={closePanel}
                aria-label="সেটিংস বন্ধ করুন"
                style={{
                  width:        '40px',
                  height:       '40px',
                  borderRadius: '50%',
                  border:       'none',
                  background:   '#F0E8D8',
                  cursor:       'pointer',
                  fontSize:     '18px',
                  display:      'flex',
                  alignItems:   'center',
                  justifyContent: 'center',
                  color:        '#2D1B00',
                  flexShrink:   0,
                  transition:   'background 0.15s ease',
                }}
                onMouseEnter={(e) => (e.target.style.background = '#E2D5C3')}
                onMouseLeave={(e) => (e.target.style.background = '#F0E8D8')}
              >
                ✕
              </button>
            </div>

            {/* ── Scrollable content ── */}
            <div style={{ padding: '4px 20px 80px' }}>

              {/* ─── SECTION 1: TYPOGRAPHY ─── */}
              <SectionHeader>অক্ষরের ধরন</SectionHeader>

              {/* Font Family */}
              <div style={{ marginBottom: '14px' }}>
                <label
                  style={{
                    fontFamily:   '"Noto Sans Bengali", sans-serif',
                    fontSize:     '14px',
                    color:        '#2D1B00',
                    display:      'block',
                    marginBottom: '8px',
                  }}
                >
                  ফন্ট পরিবার
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {FONT_FAMILIES.map((f) => (
                    <button
                      key={f.value}
                      onClick={() => update('fontFamily', f.value)}
                      aria-pressed={preferences.fontFamily === f.value}
                      style={{
                        padding:      '10px 14px',
                        borderRadius: '8px',
                        border:       preferences.fontFamily === f.value
                          ? '2px solid #E06B2E'
                          : '2px solid #E2D5C3',
                        background:   preferences.fontFamily === f.value
                          ? '#FFF0E0'
                          : '#FFFFFF',
                        cursor:       'pointer',
                        textAlign:    'left',
                        fontFamily:   `'${f.value}', 'Noto Sans Bengali', sans-serif`,
                        fontSize:     '16px',
                        color:        '#2D1B00',
                        transition:   'all 0.15s ease',
                      }}
                    >
                      {f.label} — আমি পড়তে পারি
                    </button>
                  ))}
                </div>
              </div>

              {/* Font Size */}
              <SliderRow
                label="অক্ষরের আকার"
                value={preferences.fontSize}
                min={16}
                max={36}
                step={1}
                onChange={(v) => update('fontSize', v)}
                displayValue={`${preferences.fontSize}px`}
              />

              {/* Line Height */}
              <SliderRow
                label="লাইনের ফাঁক"
                value={preferences.lineHeight}
                min={1.5}
                max={3.0}
                step={0.1}
                onChange={(v) => update('lineHeight', v)}
                displayValue={preferences.lineHeight.toFixed(1)}
              />

              {/* Letter Spacing */}
              <SliderRow
                label="অক্ষরের মধ্যে ফাঁক"
                value={preferences.letterSpacing}
                min={0}
                max={8}
                step={0.5}
                onChange={(v) => update('letterSpacing', v)}
                displayValue={`${preferences.letterSpacing}px`}
              />

              {/* Word Spacing */}
              <SliderRow
                label="শব্দের মধ্যে ফাঁক"
                value={preferences.wordSpacing}
                min={4}
                max={16}
                step={1}
                onChange={(v) => update('wordSpacing', v)}
                displayValue={`${preferences.wordSpacing}px`}
              />

              {/* Column Width */}
              <SliderRow
                label="কলামের প্রস্থ"
                value={preferences.columnWidth}
                min={60}
                max={100}
                step={5}
                onChange={(v) => update('columnWidth', v)}
                displayValue={`${preferences.columnWidth}%`}
              />

              {/* ─── SECTION 2: COLORS ─── */}
              <SectionHeader>রঙ ও পটভূমি</SectionHeader>

              {/* Background Color */}
              <div style={{ marginBottom: '14px' }}>
                <label
                  style={{
                    fontFamily:   '"Noto Sans Bengali", sans-serif',
                    fontSize:     '14px',
                    color:        '#2D1B00',
                    display:      'block',
                    marginBottom: '8px',
                  }}
                >
                  পটভূমির রঙ
                </label>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {Object.entries(COLOR_THEMES).map(([key, theme]) => (
                    <button
                      key={key}
                      onClick={() => update('colorTheme', key)}
                      aria-label={`পটভূমি: ${theme.label}`}
                      aria-pressed={preferences.colorTheme === key}
                      title={theme.label}
                      style={{
                        width:      '52px',
                        height:     '52px',
                        borderRadius: '10px',
                        border:     preferences.colorTheme === key
                          ? '3px solid #E06B2E'
                          : '2px solid #E2D5C3',
                        background: theme.bg,
                        cursor:     'pointer',
                        display:    'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'transform 0.15s ease',
                        transform:  preferences.colorTheme === key ? 'scale(1.08)' : 'scale(1)',
                        boxShadow:  preferences.colorTheme === key
                          ? '0 2px 8px rgba(224,107,46,0.4)'
                          : 'none',
                      }}
                    >
                      {preferences.colorTheme === key && (
                        <span style={{ fontSize: '16px' }}>✓</span>
                      )}
                      <span
                        style={{
                          fontFamily: '"Noto Sans Bengali", sans-serif',
                          fontSize:   '10px',
                          color:      '#2D1B00',
                          marginTop:  '2px',
                        }}
                      >
                        {theme.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Text Color */}
              <div style={{ marginBottom: '14px' }}>
                <label
                  style={{
                    fontFamily:   '"Noto Sans Bengali", sans-serif',
                    fontSize:     '14px',
                    color:        '#2D1B00',
                    display:      'block',
                    marginBottom: '8px',
                  }}
                >
                  লেখার রঙ
                </label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {Object.entries(TEXT_COLORS).map(([key, tc]) => (
                    <button
                      key={key}
                      onClick={() => update('textColor', key)}
                      aria-pressed={preferences.textColor === key}
                      aria-label={`লেখার রঙ: ${tc.label}`}
                      style={{
                        flex:         1,
                        padding:      '10px 6px',
                        borderRadius: '8px',
                        border:       preferences.textColor === key
                          ? '2px solid #E06B2E'
                          : '2px solid #E2D5C3',
                        background:   preferences.textColor === key ? '#FFF0E0' : '#FFF',
                        cursor:       'pointer',
                        display:      'flex',
                        alignItems:   'center',
                        gap:          '6px',
                        transition:   'all 0.15s ease',
                      }}
                    >
                      <span
                        style={{
                          width:        '16px',
                          height:       '16px',
                          borderRadius: '50%',
                          background:   tc.color,
                          flexShrink:   0,
                        }}
                      />
                      <span
                        style={{
                          fontFamily: '"Noto Sans Bengali", sans-serif',
                          fontSize:   '12px',
                          color:      '#2D1B00',
                        }}
                      >
                        {tc.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Highlight Color */}
              <div style={{ marginBottom: '14px' }}>
                <label
                  style={{
                    fontFamily:   '"Noto Sans Bengali", sans-serif',
                    fontSize:     '14px',
                    color:        '#2D1B00',
                    display:      'block',
                    marginBottom: '8px',
                  }}
                >
                  হাইলাইটের রঙ
                </label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {['#FFD700', '#90EE90', '#87CEEB', '#FFB6C1', '#DDA0DD'].map((color) => (
                    <button
                      key={color}
                      onClick={() => update('highlightColor', color)}
                      aria-label={`হাইলাইট রঙ ${color}`}
                      aria-pressed={preferences.highlightColor === color}
                      style={{
                        width:      '36px',
                        height:     '36px',
                        borderRadius: '8px',
                        border:     preferences.highlightColor === color
                          ? '3px solid #E06B2E'
                          : '2px solid #E2D5C3',
                        background: color,
                        cursor:     'pointer',
                        transition: 'transform 0.15s ease',
                        transform:  preferences.highlightColor === color ? 'scale(1.15)' : 'scale(1)',
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* ─── SECTION 3: PARAGRAPH BREAKS ─── */}
              <SectionHeader>অনুচ্ছেদ বিভাজন</SectionHeader>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '14px' }}>
                {[
                  { value: 'every-sentence',    label: 'প্রতি বাক্যে ভাগ', desc: 'সহজ পড়ার জন্য' },
                  { value: 'every-2-sentences',  label: 'প্রতি ২ বাক্যে', desc: 'মাঝারি পড়ার জন্য' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => update('paragraphBreak', opt.value)}
                    aria-pressed={preferences.paragraphBreak === opt.value}
                    style={{
                      padding:      '10px 14px',
                      borderRadius: '8px',
                      border:       preferences.paragraphBreak === opt.value
                        ? '2px solid #E06B2E'
                        : '2px solid #E2D5C3',
                      background:   preferences.paragraphBreak === opt.value ? '#FFF0E0' : '#FFF',
                      cursor:       'pointer',
                      textAlign:    'left',
                      transition:   'all 0.15s ease',
                    }}
                  >
                    <span
                      style={{
                        display:    'block',
                        fontFamily: '"Noto Sans Bengali", sans-serif',
                        fontSize:   '14px',
                        color:      '#2D1B00',
                        fontWeight: 500,
                      }}
                    >
                      {opt.label}
                    </span>
                    <span
                      style={{
                        display:    'block',
                        fontFamily: '"Noto Sans Bengali", sans-serif',
                        fontSize:   '11px',
                        color:      'rgba(45,27,0,0.5)',
                        marginTop:  '2px',
                      }}
                    >
                      {opt.desc}
                    </span>
                  </button>
                ))}
              </div>

              {/* ─── SECTION 4: BANGLA FEATURES ─── */}
              <SectionHeader>বাংলা বিশেষ সুবিধা</SectionHeader>

              <Toggle
                label="যুক্তবর্ণ চিহ্নিত করুন"
                description="যুক্তবর্ণের নিচে রেখা দেখাবে, ক্লিক করলে ভাঙন দেখা যাবে"
                checked={preferences.showConjunctUnderline}
                onChange={(v) => update('showConjunctUnderline', v)}
              />

              <Toggle
                label="কার-চিহ্ন রঙিন করুন"
                description="স্বরবর্ণের চিহ্নগুলো হালকা রঙে দেখাবে"
                checked={preferences.showVowelMarkColor}
                onChange={(v) => update('showVowelMarkColor', v)}
              />

              <Toggle
                label="র-ফলা সংকেত"
                description="র-ফলা আছে এমন শব্দে উপরে চিহ্ন দেখাবে"
                checked={preferences.showRephIndicator}
                onChange={(v) => update('showRephIndicator', v)}
              />

              <Toggle
                label="পরিচিত শব্দ মোটা করুন"
                description="মা, বাবা, বাড়ি ইত্যাদি শব্দ মোটা হরফে দেখাবে"
                checked={preferences.boldHighFreqWords}
                onChange={(v) => update('boldHighFreqWords', v)}
              />

              <Toggle
                label="চিত্র দেখান"
                description="অপরিচিত শব্দের পাশে ছবি দেখাবে"
                checked={preferences.showImages}
                onChange={(v) => update('showImages', v)}
              />

              {/* ── Preview box ── */}
              <div
                style={{
                  marginTop:    '20px',
                  padding:      '14px',
                  borderRadius: '10px',
                  background:   COLOR_THEMES[preferences.colorTheme]?.bg || '#FFF8E7',
                  border:       '1px solid #E2D5C3',
                }}
              >
                <p
                  style={{
                    fontFamily:    `'${preferences.fontFamily}', 'Noto Sans Bengali', sans-serif`,
                    fontSize:      `${preferences.fontSize}px`,
                    lineHeight:    preferences.lineHeight,
                    letterSpacing: `${preferences.letterSpacing}px`,
                    wordSpacing:   `${preferences.wordSpacing}px`,
                    color:         TEXT_COLORS[preferences.textColor]?.color || '#2D1B00',
                    margin:        0,
                    transition:    'all 0.2s ease',
                  }}
                  lang="bn"
                >
                  আমি পড়তে পারি।
                </p>
                <p
                  style={{
                    fontFamily: '"Noto Sans Bengali", sans-serif',
                    fontSize:   '11px',
                    color:      'rgba(45,27,0,0.4)',
                    margin:     '6px 0 0',
                  }}
                >
                  পূর্বরূপ
                </p>
              </div>
            </div>

            {/* ── Sticky Reset Footer ── */}
            <div
              style={{
                position:     'sticky',
                bottom:       0,
                padding:      '14px 20px',
                background:   '#FFFAF2',
                borderTop:    '1px solid #E2D5C3',
              }}
            >
              <button
                onClick={reset}
                style={{
                  width:        '100%',
                  padding:      '12px',
                  borderRadius: '10px',
                  border:       '2px solid #E2D5C3',
                  background:   '#FFFFFF',
                  cursor:       'pointer',
                  fontFamily:   '"Noto Sans Bengali", sans-serif',
                  fontSize:     '14px',
                  color:        '#2D1B00',
                  transition:   'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#FFF0E0';
                  e.currentTarget.style.borderColor = '#E06B2E';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#FFFFFF';
                  e.currentTarget.style.borderColor = '#E2D5C3';
                }}
                aria-label="সব সেটিংস পূর্বের অবস্থায় ফিরিয়ে দিন"
              >
                🔄 ডিফল্টে ফিরে যান
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
