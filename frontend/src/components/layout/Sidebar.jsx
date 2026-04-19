import { BotMessageSquare, BrainCircuit, LogOut, MessageSquarePlus } from "lucide-react";
import { NavLink } from "react-router-dom";
import Button from "../ui/Button";
import { APP_NAME, NAV_ITEMS } from "../../utils/constants";
import { formatRelativeTime } from "../../utils/formatDate";

export default function Sidebar({
  sessions = [],
  currentSessionId,
  onSelectSession,
  onNewSession,
  onLogout,
  user,
  mobileOpen = false,
  onClose
}) {
  return (
    <>
      <div
        className={[
          "fixed inset-0 z-30 bg-slate-950/60 backdrop-blur-sm transition-opacity duration-200 lg:hidden",
          mobileOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        ].join(" ")}
        onClick={onClose}
        aria-hidden={!mobileOpen}
      />

      <aside
        className={[
          "fixed inset-y-0 left-0 z-40 flex w-[260px] flex-col border-r border-border/70 bg-bg-surface/95 px-4 py-5 shadow-card backdrop-blur-xl transition-transform duration-200 lg:static lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        ].join(" ")}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-info text-white shadow-glow">
            <BrainCircuit className="h-5 w-5" aria-hidden="true" />
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-text-muted">AI Memory</p>
            <h2 className="text-lg font-semibold text-text-primary">{APP_NAME}</h2>
          </div>
        </div>

        <Button
          className="mt-6 w-full justify-center"
          icon={MessageSquarePlus}
          onClick={() => {
            onNewSession?.();
            onClose?.();
          }}
        >
          New Session
        </Button>

        <nav className="mt-6 grid gap-2">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                [
                  "focus-ring rounded-xl px-3 py-2 text-sm font-medium transition-colors duration-150",
                  isActive
                    ? "bg-bg-elevated text-text-primary"
                    : "text-text-muted hover:bg-bg-elevated hover:text-text-primary"
                ].join(" ")
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-8 flex min-h-0 flex-1 flex-col">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-text-muted">
              Sessions
            </p>
            <span className="rounded-full bg-bg-elevated px-2 py-1 text-[11px] text-text-muted">
              {sessions.length}
            </span>
          </div>

          <div className="space-y-2 overflow-y-auto pr-1">
            {sessions.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border p-4 text-sm text-text-muted">
                Your saved conversations will appear here once you start asking.
              </div>
            ) : (
              sessions.map((session, index) => (
                <button
                  key={session.id}
                  type="button"
                  onClick={() => {
                    onSelectSession?.(session.id);
                    onClose?.();
                  }}
                  className={[
                    "focus-ring w-full animate-slide-up rounded-2xl border border-transparent px-3 py-3 text-left transition-all duration-150 hover:border-primary/20 hover:bg-bg-elevated",
                    currentSessionId === session.id
                      ? "border-primary/30 bg-bg-elevated shadow-glow"
                      : "bg-transparent",
                    "relative before:absolute before:left-0 before:top-3 before:h-[calc(100%-24px)] before:w-1 before:rounded-full",
                    currentSessionId === session.id ? "before:bg-primary" : "before:bg-transparent"
                  ].join(" ")}
                  style={{ animationDelay: `${index * 60}ms` }}
                >
                  <p className="line-clamp-2 text-sm font-medium text-text-primary">
                    {session.title}
                  </p>
                  <div className="mt-2 flex items-center justify-between gap-2 text-xs text-text-muted">
                    <span>{formatRelativeTime(session.createdAt)}</span>
                    <span>{session.questionCount} questions</span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-border bg-bg-elevated/80 p-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary">
              {user?.username?.[0]?.toUpperCase() || "N"}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-text-primary">
                {user?.username || "NeuroGraph User"}
              </p>
              <p className="truncate text-xs text-text-muted">{user?.email}</p>
            </div>

            <button
              type="button"
              onClick={onLogout}
              className="focus-ring inline-flex h-10 w-10 items-center justify-center rounded-full text-text-muted transition-colors duration-150 hover:bg-bg-surface hover:text-error"
              aria-label="Log out"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
          <div className="mt-3 flex items-center gap-2 rounded-xl bg-bg-surface/80 px-3 py-2 text-xs text-text-muted">
            <BotMessageSquare className="h-4 w-4 text-info" aria-hidden="true" />
            Memory-aware answers stay attached to this account.
          </div>
        </div>
      </aside>
    </>
  );
}

