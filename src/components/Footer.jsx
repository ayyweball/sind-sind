import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-[#ded8cb] bg-[#f4f0e6] px-[5vw] pt-16 pb-12 text-[#141310]">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 pb-16 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          {/* Brand & Purpose */}
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <span className="font-serif text-2xl font-semibold tracking-tight text-[#141310]">
                SIND &amp; SIND
              </span>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-[#45423b]">
              Specialised e-commerce strategy and decision support. Helping founders and operators turn complicated commercial trade-offs into practical, disciplined next steps through explainable decision frameworks.
            </p>
            <div className="pt-2">
              <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#6e6a60]">
                Rules-Based Decision Support
              </span>
            </div>
          </div>

          {/* Practice Areas */}
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.14em] text-[#c5301a]">
              Expertise
            </p>
            <ul className="mt-5 space-y-2.5 text-sm">
              <li>
                <Link to="/expertise" className="text-[#45423b] transition-colors hover:text-[#c5301a]">
                  Paid Acquisition
                </Link>
              </li>
              <li>
                <Link to="/expertise" className="text-[#45423b] transition-colors hover:text-[#c5301a]">
                  Conversion &amp; Funnel
                </Link>
              </li>
              <li>
                <Link to="/expertise" className="text-[#45423b] transition-colors hover:text-[#c5301a]">
                  Pricing &amp; Margin
                </Link>
              </li>
              <li>
                <Link to="/expertise" className="text-[#45423b] transition-colors hover:text-[#c5301a]">
                  Inventory &amp; Fulfilment
                </Link>
              </li>
              <li>
                <Link to="/expertise" className="text-[#45423b] transition-colors hover:text-[#c5301a]">
                  Marketplaces &amp; Expansion
                </Link>
              </li>
              <li>
                <Link to="/expertise" className="text-[#45423b] transition-colors hover:text-[#c5301a]">
                  Returns &amp; Customer Experience
                </Link>
              </li>
            </ul>
          </div>

          {/* Perspectives & Diagnostic */}
          <div className="space-y-8">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.14em] text-[#c5301a]">
                Perspectives
              </p>
              <ul className="mt-5 space-y-2.5 text-sm">
                <li>
                  <Link to="/insights" className="text-[#45423b] transition-colors hover:text-[#c5301a]">
                    Strategic Insights
                  </Link>
                </li>
                <li>
                  <Link to="/insights" className="text-[#45423b] transition-colors hover:text-[#c5301a]">
                    Decision Memos
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <p className="font-mono text-xs uppercase tracking-[0.14em] text-[#c5301a]">
                Diagnostic
              </p>
              <ul className="mt-5 space-y-2.5 text-sm">
                <li>
                  <Link to="/consultant" className="text-[#45423b] transition-colors hover:text-[#c5301a]">
                    Decision Support Engine
                  </Link>
                </li>
                <li>
                  <Link to="/consultant" className="text-[#45423b] transition-colors hover:text-[#c5301a]">
                    Playbook Matcher
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Firm & Direct Action */}
          <div className="space-y-8">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.14em] text-[#c5301a]">
                Firm
              </p>
              <ul className="mt-5 space-y-2.5 text-sm">
                <li>
                  <Link to="/about" className="text-[#45423b] transition-colors hover:text-[#c5301a]">
                    About Sind &amp; Sind
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="text-[#45423b] transition-colors hover:text-[#c5301a]">
                    Explainable Methodology
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <Link to="/consultant" className="button-primary inline-flex w-full justify-center">
                Run a diagnosis <span>→</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Hairline Rule & Bottom Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[#ded8cb] pt-8 font-mono text-xs text-[#6e6a60]">
          <span>© {new Date().getFullYear()} SIND &amp; SIND. ALL RIGHTS RESERVED.</span>
          <span className="hidden sm:inline">EXPLAINABLE E-COMMERCE DECISION SUPPORT</span>
          <Link to="/consultant" className="underline underline-offset-4 hover:text-[#c5301a]">
            Free Decision Diagnostic →
          </Link>
        </div>
      </div>
    </footer>
  );
}
