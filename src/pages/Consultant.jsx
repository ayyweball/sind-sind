import { useState } from 'react';
import Reveal from '../components/Reveal.jsx';

const prompts = [
  'Should I raise my ad spend or fix conversion first?',
  'My cart abandonment rate is high—where do I start?',
  'Should I expand to Amazon or TikTok Shop?',
  'My supplier raised prices 20%. What should I review?'
];

export default function Consultant() {
  const [question, setQuestion] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(event) {
    event.preventDefault();
    if (!question.trim() || loading) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL ?? ''}/api/advice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: question.trim() })
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || 'Unable to match a decision playbook right now.');
      setResult(body);
    } catch (caught) {
      setError(caught.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="px-[5vw] py-16 md:py-28">
      <div className="mx-auto max-w-4xl">
        <Reveal>
          <span className="font-mono text-xs uppercase tracking-[0.14em] text-[#c5301a]">
            Interactive Decision Support
          </span>
          <h1 className="display mt-4">
            Bring us a commercial trade-off.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-[#45423b]">
            This rules-based diagnostic evaluates your commercial situation against structured e-commerce playbooks to produce a targeted Situation Assessment, Strategic Recommendation, and Operational Risk guardrails.
          </p>
        </Reveal>

        {/* Diagnostic Input Card */}
        <Reveal className="mt-12 border border-[#ded8cb] bg-[#fcfbf8] shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#ded8cb] bg-[#f4f0e6] px-6 py-4">
            <span className="font-mono text-xs uppercase tracking-[0.12em] text-[#141310]">
              Decision Diagnostic Terminal
            </span>
            <span className="font-mono text-[11px] uppercase tracking-wider text-[#c5301a]">
              Explainable · Deterministic
            </span>
          </div>

          <form onSubmit={submit} className="p-6 md:p-8">
            <label htmlFor="question" className="sr-only">
              Describe your commercial situation
            </label>
            <textarea
              id="question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              maxLength="600"
              required
              rows="4"
              placeholder="Describe the trade-off or commercial problem your business is facing…"
              className="w-full resize-y border border-[#ded8cb] bg-[#fcfbf8] p-4 font-sans text-base text-[#141310] placeholder-[#6e6a60] outline-none transition focus:border-[#141310]"
            />

            <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
              <span className="font-mono text-xs text-[#6e6a60]">
                Max 600 characters · Processed securely via local decision rules
              </span>
              <button
                type="submit"
                disabled={loading}
                className="button-primary disabled:cursor-wait disabled:opacity-60"
              >
                {loading ? 'Evaluating…' : 'Run diagnosis'} <span>→</span>
              </button>
            </div>
          </form>

          {/* Sample Prompts */}
          <div className="border-t border-[#ded8cb] bg-[#f4f0e6] p-6">
            <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-[#6e6a60]">
              Select A Representative Commercial Scenario:
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {prompts.map((prompt) => (
                <button
                  type="button"
                  onClick={() => setQuestion(prompt)}
                  key={prompt}
                  className="border border-[#ded8cb] bg-[#fcfbf8] px-3.5 py-2 text-left font-sans text-xs text-[#141310] transition-colors hover:border-[#141310] hover:bg-[#141310] hover:text-[#fcfbf8]"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        </Reveal>

        {/* Error Alert */}
        {error && (
          <div role="alert" className="mt-8 border-l-4 border-[#c5301a] bg-[#f4f0e6] p-5 font-mono text-xs text-[#141310]">
            {error}
          </div>
        )}

        {/* Consulting Advisory Memorandum Output */}
        {result && (
          <Reveal className="mt-12">
            <article className="border border-[#ded8cb] bg-[#fcfbf8] p-8 md:p-12 shadow-sm">
              {/* Memo Header */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#ded8cb] pb-6">
                <div>
                  <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#c5301a]">
                    Advisory Memorandum
                  </span>
                  <h2 className="font-serif text-2xl text-[#141310] mt-1">
                    Decision Analysis &amp; Strategic Guidance
                  </h2>
                </div>
                <div className="text-right">
                  <span className="font-mono text-xs text-[#6e6a60] block">
                    PRACTICE DOMAIN
                  </span>
                  <span className="font-mono text-xs font-semibold text-[#141310] uppercase">
                    {result.match}
                  </span>
                </div>
              </div>

              {/* Memo Body Sections */}
              <div className="mt-8 space-y-8 divide-y divide-[#ded8cb]">
                <section className="pt-2">
                  <h3 className="font-mono text-xs uppercase tracking-[0.12em] text-[#c5301a]">
                    Section I — Situation Assessment
                  </h3>
                  <p className="mt-3 text-base leading-relaxed text-[#141310]">
                    {result.situation}
                  </p>
                </section>

                <section className="pt-8">
                  <h3 className="font-mono text-xs uppercase tracking-[0.12em] text-[#c5301a]">
                    Section II — Strategic Recommendation
                  </h3>
                  <p className="mt-3 text-base leading-relaxed text-[#141310]">
                    {result.recommendation}
                  </p>
                </section>

                <section className="pt-8">
                  <h3 className="font-mono text-xs uppercase tracking-[0.12em] text-[#c5301a]">
                    Section III — Operational Risk &amp; Guardrails
                  </h3>
                  <p className="mt-3 text-base leading-relaxed text-[#141310]">
                    {result.risk}
                  </p>
                </section>
              </div>

              {/* Memo Footer */}
              <div className="mt-10 border-t border-[#ded8cb] pt-6 flex flex-wrap items-center justify-between gap-4 font-mono text-xs text-[#6e6a60]">
                <span>Validated Rules Match · Sind &amp; Sind Playbook Library</span>
                <button
                  type="button"
                  onClick={() => {
                    setResult(null);
                    setQuestion('');
                  }}
                  className="editorial-link"
                >
                  Test another scenario <span>→</span>
                </button>
              </div>
            </article>
          </Reveal>
        )}
      </div>
    </section>
  );
}
