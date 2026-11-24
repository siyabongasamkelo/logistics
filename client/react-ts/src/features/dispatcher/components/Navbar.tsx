import React from "react";

interface NavbarProps {
  activeRole: "OWNER" | "DISPATCHER" | "DRIVER";
  setActiveRole: (role: "OWNER" | "DISPATCHER" | "DRIVER") => void;
  activeView: "LIVE" | "ANALYTICS";
  setActiveView: (view: "LIVE" | "ANALYTICS") => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeRole,
  setActiveRole,
  setActiveView,
}) => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-10">
        {/* Brand Identity */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold tracking-tight shadow-sm">
            TF
          </div>
          <div>
            <span className="text-base font-bold tracking-tight text-slate-900">
              TrolleyFleet
            </span>
            <span className="ml-2 rounded-md bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold text-indigo-700">
              LIVE OPS
            </span>
          </div>
        </div>

        {/* Right Controls: Role Toggle + Initials + Settings + Logout */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="hidden sm:flex items-center rounded-lg bg-slate-100 p-1 border border-slate-200/60">
            <button
              onClick={() => setActiveRole("DISPATCHER")}
              className={`rounded-md px-2.5 py-1 text-xs font-semibold transition ${
                activeRole === "DISPATCHER"
                  ? "bg-white text-indigo-600 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Dispatcher
            </button>
            <button
              onClick={() => setActiveRole("OWNER")}
              className={`rounded-md px-2.5 py-1 text-xs font-semibold transition ${
                activeRole === "OWNER"
                  ? "bg-white text-indigo-600 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Owner View
            </button>
            <button
              onClick={() => setActiveRole("DRIVER")}
              className={`rounded-md px-2.5 py-1 text-xs font-semibold transition ${
                activeRole === "DRIVER"
                  ? "bg-white text-indigo-600 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Driver View
            </button>
          </div>

          <div className="h-5 w-px bg-slate-200 hidden sm:block" />

          {/* Initials & Name */}
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700 border border-indigo-200">
              SM
            </div>
            <div className="hidden md:block text-left leading-tight">
              <p className="text-xs font-semibold text-slate-800">
                Siyabonga M.
              </p>
              <p className="text-[11px] text-slate-400">Ops Lead</p>
            </div>
          </div>

          {/* Settings Icon */}
          {/* Settings / Menu Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsMenuOpen((prev) => !prev)}
              title="Menu & Analytics"
              className="rounded-lg border border-slate-200 bg-white p-2 text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </button>

            {isMenuOpen && (
              <div
                onMouseLeave={() => setIsMenuOpen(false)}
                className="absolute right-0 mt-2 w-56 rounded-xl bg-white p-1.5 shadow-lg border border-slate-200 z-40"
              >
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    setActiveView("ANALYTICS");
                  }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition"
                >
                  <span>📊</span> Operations Intelligence
                </button>
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    setActiveView("LIVE");
                  }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  <span>⚡</span> Live Dispatch Board
                </button>
              </div>
            )}
          </div>

          {/* Logout Button */}
          <button
            onClick={() => console.log("Logout")}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 transition"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};
