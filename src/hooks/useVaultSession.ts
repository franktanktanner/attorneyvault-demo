import { useEffect, useState } from "react";

export interface VaultSessionState {
  secondsRemaining: number;
  locked: boolean;
  warning: boolean;
}

const SESSION_SECONDS = 10 * 60;

export function useVaultSession(): VaultSessionState {
  const [secondsRemaining, setSecondsRemaining] = useState(SESSION_SECONDS);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => window.clearInterval(interval);
  }, []);

  return {
    secondsRemaining,
    locked: secondsRemaining <= 0,
    warning: secondsRemaining > 0 && secondsRemaining <= 120,
  };
}
