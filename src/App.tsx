import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import VaultHome from "./pages/VaultHome";
import Rolodex from "./pages/Rolodex";
import AttorneyProfile from "./pages/AttorneyProfile";
import Pipeline from "./pages/Pipeline";
import Intelligence from "./pages/Intelligence";
import Enrichment from "./pages/Enrichment";
import VaultMode from "./pages/VaultMode";
import Reports from "./pages/Reports";
import { ToastProvider } from "./contexts/ToastContext";
import { VaultSessionProvider } from "./contexts/VaultSessionContext";
import { RequireUnlock } from "./components/auth/RequireUnlock";
import { DemoNav } from "./components/dev/DemoNav";

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <VaultSessionProvider>
          <DemoNav />
          <Routes>
            <Route path="/" element={<Login />} />
            <Route element={<RequireUnlock />}>
              <Route path="/vault" element={<VaultHome />} />
              <Route path="/rolodex" element={<Rolodex />} />
              <Route path="/attorney/:id" element={<AttorneyProfile />} />
              <Route path="/pipeline" element={<Pipeline />} />
              <Route path="/intelligence" element={<Intelligence />} />
              <Route path="/enrichment" element={<Enrichment />} />
              <Route path="/vault-mode" element={<VaultMode />} />
              <Route path="/reports" element={<Reports />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </VaultSessionProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
