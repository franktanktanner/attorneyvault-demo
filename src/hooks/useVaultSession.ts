import { useVaultSessionContext } from "../contexts/VaultSessionContext";

export interface VaultSessionState {
  secondsRemaining: number;
  locked: boolean;
  warning: boolean;
  formatted: string;
  reset: () => void;
}

export function useVaultSession(): VaultSessionState {
  const { remainingSeconds, reset, formatted } = useVaultSessionContext();
  return {
    secondsRemaining: remainingSeconds,
    locked: remainingSeconds <= 0,
    warning: remainingSeconds > 0 && remainingSeconds <= 120,
    formatted,
    reset,
  };
}
