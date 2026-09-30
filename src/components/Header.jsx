import { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinkClass = ({ isActive }) =>
    `font-mono text-xs tracking-[0.14em] uppercase transition-colors py-1 ${
      isActive
        ? 'text-[#c5301a] font-medium border-b border-[#c5301a]'
        : 'text-[#141310] hover:text-[#c5301a]'
    }`;

  const mobileNavLinkClass = ({ isActive }) =>
    `font-mono text-sm tracking-[0.14em] uppercase py-3 border-b border-[#ded8cb] flex items-center justify-between transition-colors ${
      isActive ? 'text-[#c5301a] font-medium' : 'text-[#141310]'
    }`;

  return (
    <header className="sticky top-0 z-50 border-b border-[#ded8cb] bg-[#fcfbf8]/95 backdrop-blur-xs">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-[5vw] py-4 md:py-5">
        {/* Brand / Wordmark */}
        <div className="flex items-center">
          <Link
            to="/"
            aria-label="Sind & Sind Home"
            className="flex items-center transition-opacity hover:opacity-85"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div className="logo-frame w-28 sm:w-36">
              <img src="/sind-and-sind-logo.png" alt="Sind & Sind" className="logo-image" />
            </div>
            <span className="sr-only">Sind & Sind</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav
          aria-label="Main navigation"
          className="hidden items-center gap-8 md:flex"
        >
          <NavLink to="/expertise" className={navLinkClass}>
            Expertise
          </NavLink>
          <NavLink to="/insights" className={navLinkClass}>
            Insights
          </NavLink>
          <NavLink to="/consultant" className={navLinkClass}>
            Consultant
          </NavLink>
          <NavLink to="/about" className={navLinkClass}>
            About
          </NavLink>
        </nav>

        {/* Desktop CTA & Mobile Toggle */}
        <div className="flex items-center gap-4">
          <Link
            to="/app"
            className="button-primary hidden sm:inline-flex"
          >
            Operating Console <span>→</span>
          </Link>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle navigation menu"
            className="flex h-10 w-10 items-center justify-center border border-[#ded8cb] bg-transparent text-[#141310] transition-colors hover:bg-[#f4f0e6] md:hidden"
          >
            {mobileMenuOpen ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="1.5" d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="border-t border-[#ded8cb] bg-[#fcfbf8] px-[5vw] py-6 md:hidden">
          <nav aria-label="Mobile navigation" className="flex flex-col">
            <NavLink
              to="/expertise"
              className={mobileNavLinkClass}
              onClick={() => setMobileMenuOpen(false)}
            >
              <span>Expertise</span>
              <span className="font-mono text-xs text-[#6e6a60]">01</span>
            </NavLink>
            <NavLink
              to="/insights"
              className={mobileNavLinkClass}
              onClick={() => setMobileMenuOpen(false)}
            >
              <span>Insights</span>
              <span className="font-mono text-xs text-[#6e6a60]">02</span>
            </NavLink>
            <NavLink
              to="/consultant"
              className={mobileNavLinkClass}
              onClick={() => setMobileMenuOpen(false)}
            >
              <span>Consultant</span>
              <span className="font-mono text-xs text-[#6e6a60]">03</span>
            </NavLink>
            <NavLink
              to="/about"
              className={mobileNavLinkClass}
              onClick={() => setMobileMenuOpen(false)}
            >
              <span>About</span>
              <span className="font-mono text-xs text-[#6e6a60]">04</span>
            </NavLink>

            <div className="mt-6 pt-2">
              <Link
                to="/app"
                className="button-primary w-full justify-center py-3.5"
                onClick={() => setMobileMenuOpen(false)}
              >
                Operating Console <span>→</span>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
