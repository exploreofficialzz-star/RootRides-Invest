import { Instagram, Twitter, Linkedin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-dark-green pt-20 pb-10" data-section-bg="dark">
      <div className="max-w-[1280px] mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-accent" />
              <span className="font-display text-xl text-white">
                RootRides Invest
              </span>
            </div>
            <p className="text-xs font-body font-medium uppercase tracking-[0.08em] text-[#4a635e]">
              Grow your wealth with real assets
            </p>
          </div>

          {/* Platform */}
          <div>
            <h5 className="text-white font-body font-semibold text-sm mb-4">
              Platform
            </h5>
            <ul className="space-y-3">
              {[
                { label: "Home", href: "#" },
                { label: "Investment Plans", href: "#plans" },
                { label: "Referrals", href: "#referrals" },
                { label: "FAQ", href: "#faq" },
                { label: "Download", href: "#download" },
              ].map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-[#4a635e] text-sm hover:text-white transition-colors duration-200"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h5 className="text-white font-body font-semibold text-sm mb-4">
              Legal
            </h5>
            <ul className="space-y-3">
              {["Terms of Service", "Privacy Policy", "Compliance"].map(
                (label) => (
                  <li key={label}>
                    <a
                      href="#"
                      className="text-[#4a635e] text-sm hover:text-white transition-colors duration-200"
                    >
                      {label}
                    </a>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h5 className="text-white font-body font-semibold text-sm mb-4">
              Support
            </h5>
            <ul className="space-y-3">
              {[
                { label: "Contact Us", href: "#" },
                { label: "Help Center", href: "#" },
                { label: "info@rootrides.com", href: "mailto:info@rootrides.com" },
              ].map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-[#4a635e] text-sm hover:text-white transition-colors duration-200"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/[0.08] pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs font-body font-medium uppercase tracking-[0.08em] text-[#4a635e]">
            &copy; 2025 RootRides Invest. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            {[
              { Icon: Instagram, label: "Instagram" },
              { Icon: Twitter, label: "Twitter" },
              { Icon: Linkedin, label: "LinkedIn" },
            ].map(({ Icon, label }) => (
              <a
                key={label}
                href="#"
                aria-label={label}
                className="text-white/40 hover:text-white transition-colors duration-200"
              >
                <Icon size={18} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
