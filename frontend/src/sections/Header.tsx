import { useState } from "react";
import { Menu, X, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { auth } from "@/lib/api";

const NAV_ITEMS = [
  { label: "Why RootRides", href: "/#why" },
  { label: "FAQ",           href: "/#faq" },
  { label: "Download",      href: "/#download" },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser]             = useState(auth.getUser());
  const navigate                    = useNavigate();

  const handleLogout = () => {
    auth.logout();
    setUser(null);
    setMobileOpen(false);
    navigate("/");
  };

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50"
      style={{ background: "rgba(2,35,28,0.97)", borderBottom: "1px solid rgba(255,255,255,0.06)", backdropFilter: "blur(12px)" }}
    >
      <div className="max-w-[1280px] mx-auto px-6 flex items-center justify-between h-16">

        {/* Brand */}
        <Link to="/" className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#f59e0b]" />
          <span className="font-display text-white text-xl">RootRides Invest</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {NAV_ITEMS.map((item) => (
            <a key={item.href} href={item.href}
              className="text-sm font-medium text-white/70 hover:text-white transition-colors">
              {item.label}
            </a>
          ))}
        </nav>

        {/* Desktop auth */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <>
              <span className="text-white/70 text-sm">{user.full_name.split(" ")[0]}</span>
              <Link to="/dashboard" className="px-5 py-2.5 bg-[#f59e0b] text-[#02231c] text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity">
                Dashboard
              </Link>
              <button onClick={handleLogout} className="flex items-center gap-1.5 text-white/50 text-sm hover:text-white/80 transition-colors">
                <LogOut size={14} /> Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/auth" className="text-sm font-medium text-white/70 hover:text-white transition-colors">
                Sign In
              </Link>
              <Link to="/auth" className="px-5 py-2.5 bg-[#f59e0b] text-[#02231c] text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity">
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button className="md:hidden text-white" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div style={{ background: "rgba(2,35,28,0.98)", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <nav className="flex flex-col p-6 gap-4">
            {NAV_ITEMS.map((item) => (
              <a key={item.href} href={item.href}
                className="text-white text-lg font-medium hover:text-[#f59e0b] transition-colors"
                onClick={() => setMobileOpen(false)}>
                {item.label}
              </a>
            ))}
            <div className="flex flex-col gap-3 pt-4 border-t border-white/10">
              {user ? (
                <>
                  <Link to="/dashboard" className="py-3 bg-[#f59e0b] text-[#02231c] text-center font-semibold rounded-xl"
                    onClick={() => setMobileOpen(false)}>
                    Dashboard
                  </Link>
                  <button onClick={handleLogout} className="flex items-center gap-2 text-white/50 text-base">
                    <LogOut size={16} /> Log out
                  </button>
                </>
              ) : (
                <>
                  <Link to="/auth" className="text-white text-lg font-medium" onClick={() => setMobileOpen(false)}>Sign In</Link>
                  <Link to="/auth" className="py-3 bg-[#f59e0b] text-[#02231c] text-center font-semibold rounded-xl"
                    onClick={() => setMobileOpen(false)}>
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
