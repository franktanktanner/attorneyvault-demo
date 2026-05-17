import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";

interface VaultSessionContextValue {
  remainingSeconds: number;
  reset: () => void;
  formatted: string;
}

const VaultSessionContext = createContext<VaultSessionContextValue | null>(null);

const SESSION_SECONDS = 10 * 60;

function formatTime(seconds: number): string {
  const safe = Math.max(0, seconds);
  const m = Math.floor(safe / 60).toString().padStart(2, "0");
  const s = (safe % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export function VaultSessionProvider({ children }: { children: ReactNode }) {
  const [remainingSeconds, setRemainingSeconds] = useState(SESSION_SECONDS);
  const navigate = useNavigate();
  const expiredRef = useRef(false);

  useEffect(() => {
    const id = window.setInterval(() => {
      setRemainingSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (remainingSeconds === 0 && !expiredRef.current) {
      expiredRef.current = true;
      sessionStorage.removeItem("vault_unlocked");
      navigate("/", { replace: true });
    }
    if (remainingSeconds > 0 && expiredRef.current) {
      expiredRef.current = false;
    }
  }, [remainingSeconds, navigate]);

  const reset = useCallback(() => {
    expiredRef.current = false;
    setRemainingSeconds(SESSION_SECONDS);
  }, []);

  return (
    <VaultSessionContext.Provider
      value={{
        remainingSeconds,
        reset,
        formatted: formatTime(remainingSeconds),
      }}
    >
      {children}
    </VaultSessionContext.Provider>
  );
}

export function useVaultSessionContext(): VaultSessionContextValue {
  const ctx = useContext(VaultSessionContext);
  if (!ctx) {
    throw new Error(
      "useVaultSessionContext must be used within a VaultSessionProvider"
    );
  }
  return ctx;
}
