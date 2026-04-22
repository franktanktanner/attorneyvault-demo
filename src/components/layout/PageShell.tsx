import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { FooterStrip } from "./FooterStrip";

export interface PageShellProps {
  children: ReactNode;
}

export function PageShell({ children }: PageShellProps) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-vault-paper text-vault-ink">
      <Sidebar />
      <TopBar />
      <main
        className="ml-[220px] pt-16 pb-12 bg-vault-paper"
        style={{
          backgroundImage:
            "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"200\" height=\"200\"><filter id=\"n\"><feTurbulence baseFrequency=\"0.9\" numOctaves=\"2\"/><feColorMatrix values=\"0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.03 0\"/></filter><rect width=\"200\" height=\"200\" filter=\"url(%23n)\"/></svg>')",
          backgroundBlendMode: "multiply",
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
            className="max-w-[1440px] mx-auto px-12 py-10 min-h-[calc(100vh-6rem)]"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
      <FooterStrip />
    </div>
  );
}
