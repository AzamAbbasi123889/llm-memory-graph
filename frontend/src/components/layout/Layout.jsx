import { useState } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import useAuthStore from "../../store/authStore";

export default function Layout({
  title,
  subtitle,
  actions,
  sessions,
  currentSessionId,
  onSelectSession,
  onNewSession,
  children
}) {
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary">
      <div className="flex min-h-screen">
        <Sidebar
          sessions={sessions}
          currentSessionId={currentSessionId}
          onSelectSession={onSelectSession}
          onNewSession={onNewSession}
          onLogout={() => logout("/login")}
          user={user}
          mobileOpen={mobileOpen}
          onClose={() => setMobileOpen(false)}
        />

        <div className="flex min-h-screen min-w-0 flex-1 flex-col lg:pl-0">
          <Navbar
            title={title}
            subtitle={subtitle}
            actions={actions}
            onMenuClick={() => setMobileOpen(true)}
          />

          <main
            key={location.pathname}
            className="page-transition flex-1 px-4 py-6 sm:px-6"
          >
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

