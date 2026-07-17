// client/src/pages/BornoBazar/ShopShelf.jsx
// ─── Reusable wooden shelf component ─────────────────────────────────────────
// Props:
//   products     : array of completed product objects (from PHASE2_WORDS)
//   slotCount    : number of product slots to render (default 3)
//   onAddProduct : callback when an empty slot is clicked

import { motion, AnimatePresence } from 'framer-motion';

const SLOT_COUNT_DEFAULT = 3;

// ── Single filled slot ───────────────────────────────────────────────────────
function FilledSlot({ product, index }) {
  return (
    <motion.div
      className="ss-slot ss-slot--filled"
      initial={{ y: 20, scale: 0.6, opacity: 0 }}
      animate={{ y: 0, scale: 1, opacity: 1 }}
      transition={{ type: 'spring', bounce: 0.45, delay: index * 0.08 }}
      title={product.product}
      aria-label={product.product}
    >
      {/* Glow ring to celebrate a freshly stocked product */}
      <span className="ss-slot-glow" aria-hidden="true" />
      <span className="ss-slot-emoji" role="img" aria-hidden="true">
        {product.emoji}
      </span>
      <span className="ss-slot-name">{product.product}</span>
    </motion.div>
  );
}

// ── Single empty / CTA slot ─────────────────────────────────────────────────
function EmptySlot({ onAdd, index }) {
  return (
    <motion.button
      className="ss-slot ss-slot--empty"
      onClick={(e) => {
        e.stopPropagation();
        onAdd?.();
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: index * 0.06 }}
      whileHover={{ scale: 1.08, backgroundColor: 'rgba(255,255,255,0.22)' }}
      whileTap={{ scale: 0.94 }}
      aria-label="পণ্য যোগ করুন"
    >
      <span className="ss-slot-plus" aria-hidden="true">＋</span>
      <span className="ss-slot-empty-label">পণ্য যোগ করুন</span>
    </motion.button>
  );
}

// ── Main shelf ───────────────────────────────────────────────────────────────
export default function ShopShelf({
  products = [],
  slotCount = SLOT_COUNT_DEFAULT,
  onAddProduct,
}) {
  const filled  = products.length;
  const pct     = Math.round((filled / slotCount) * 100);
  const isFullyStocked = filled >= slotCount;

  return (
    <div className="ss-wrapper" role="region" aria-label="দোকানের তাক">

      {/* ── Progress label ── */}
      <div className="ss-progress-row" aria-live="polite">
        <span className="ss-progress-text">
          {isFullyStocked
            ? '🌟 দোকান প্রস্তুত!'
            : `${filled}/${slotCount} পণ্য`}
        </span>
        <div className="ss-progress-track" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
          <motion.div
            className="ss-progress-fill"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* ── Shelf board ── */}
      <div className="ss-shelf">

        {/* Left bracket */}
        <div className="ss-bracket ss-bracket--left" aria-hidden="true" />

        {/* Slots */}
        <div className="ss-slots" role="list">
          <AnimatePresence>
            {Array.from({ length: slotCount }).map((_, idx) => {
              const product = products[idx];
              return (
                <div key={idx} className="ss-slot-wrapper" role="listitem">
                  {product
                    ? <FilledSlot product={product} index={idx} />
                    : <EmptySlot onAdd={onAddProduct} index={idx} />
                  }
                </div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Right bracket */}
        <div className="ss-bracket ss-bracket--right" aria-hidden="true" />
      </div>

      {/* ── Plank edge (shadow) ── */}
      <div className="ss-plank-edge" aria-hidden="true" />

    </div>
  );
}
