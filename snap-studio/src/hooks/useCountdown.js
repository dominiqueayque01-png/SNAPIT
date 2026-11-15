import { useState, useCallback, useRef } from "react";

export default function useCountdown({ onTick, onComplete } = {}) {
  const [countdown, setCountdown] = useState(null);
  const timerRef = useRef(null);

  const startCountdown = useCallback(
    async (seconds = 3) => {
      for (let c = seconds; c > 0; c--) {
        setCountdown(c);
        if (onTick) onTick(c);
        await new Promise(r => setTimeout(r, 1000));
      }

      setCountdown("SMILE! 📸");
      if (onTick) onTick("SMILE! 📸");
      await new Promise(r => setTimeout(r, 400));

      setCountdown(null);
      if (onComplete) onComplete();
    },
    [onTick, onComplete]
  );

  const cancelCountdown = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setCountdown(null);
  }, []);

  return {
    countdown,
    startCountdown,
    cancelCountdown
  };
}
