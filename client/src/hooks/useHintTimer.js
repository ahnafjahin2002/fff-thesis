// client/src/hooks/useHintTimer.js

import { useState, useEffect } from "react";

/**
 * Watches failureCount. When it reaches 2, marks hint as active.
 * Resets when question changes (resetKey changes).
 */
export function useHintTimer(failureCount, resetKey) {
  const [hintActive, setHintActive] = useState(false);

  // Reset when question changes
  useEffect(() => {
    setHintActive(false);
  }, [resetKey]);

  // Trigger hint at 2 failures
  useEffect(() => {
    if (failureCount >= 2) {
      setHintActive(true);
    }
  }, [failureCount]);

  return hintActive;
}