import { useState, useEffect, useRef } from "react";
import { Menu, X, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { auth } from "@/lib/api";

const NAV_ITEMS = [
  { label: "Investment Plans", href: "/#plans" },
  { label: "Why RootRides",    href: "/#why" },
  { label: "Referrals",        href: "/#referrals" },
  { label: "FAQ",              href: "/#faq" },
  { label: "Download",         href: "/#download" },
];

export default function Header() {
  const [isDark, setIsDark]           = useState(true);
  const [mobileOpen, setMobileOpen]   = useState(false);
  const [user, setUser]               = useState(auth.getUser());
  const headerRef                     = useRef<HTMLElement>(null);
  const navigate                      = useNavigate();

  useEffect(() => {
    const sections = document.querySelectorAll("[data-section-bg]");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const bg = entry.target.getAttribute("data-section-bg");
            setIsDark(bg === "dark");
          }
        });
      },
      { threshold: 0.1, rootMargin: "-80px 0px 0px 0px" }
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  const handleLogout = () => {
    auth.logout();
    setUser(null);
    setMobileOpen(false);
    navigate("/");
  };

  const textColor = isDark ? "text-white" : "text-dark-green";

  return (
    <header
      ref={headerRef}
      className="fixed top-0 left-0 right-0 z-50 transition-colors duration-300"
    >
      <div className="max-w-[1280px] mx-auto px-6 flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-2 h-2 rounded-full bg-accent" />
          <span className={`font-display text-2xl ${textColor} transition-colors duration-300`}>
            RootRides Invest
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={`text-sm font-body font-medium ${textColor} hover:opacity-70 transition-all duration-200 relative group`}
            >
              {item.label}
              <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-current transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
        </nav>

        {/* Desktop Auth */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <>
              <span className={`text-sm font-body font-medium ${textColor}`}>
                {user.full_name.split(" ")[0]}
              </span>
              <button
                onClick={handleLogout}
                className={`flex items-center gap-1.5 text-sm font-body font-medium ${textColor} hover:opacity-70 transition-opacity`}
              >
                <LogOut size={14} />
                Log out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/auth"
                className={`text-sm font-body font-medium ${textColor} hover:opacity-70 transition-opacity`}
              >
                Sign In
              </Link>
              <Link
                to="/auth"
                className="px-5 py-2.5 bg-primary text-white text-sm font-medium rounded-xl hover:opacity-90 hover:-translate-y-px transition-all duration-200"
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className={`md:hidden ${textColor}`}
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-dark-green/95 backdrop-blur-lg border-t border-white/10">
          <nav className="flex flex-col p-6 gap-4">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-white text-lg font-body font-medium hover:text-accent transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </a>
            ))}
            <div className="flex flex-col gap-3 pt-4 border-t border-white/10">
              {user ? (
                <>
                  <span className="text-white text-lg font-medium">{user.full_name}</span>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-white/60 text-base"
                  >
                    <LogOut size={16} /> Log out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/auth"
                    className="text-white text-lg font-medium"
                    onClick={() => setMobileOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/auth"
                    className="px-5 py-3 bg-primary text-white text-center font-medium rounded-xl"
                    onClick={() => setMobileOpen(false)}
                  >
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
