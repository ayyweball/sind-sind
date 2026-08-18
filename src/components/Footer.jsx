import { Link } from 'react-router-dom';
export default function Footer() {
  return <footer className="border-t border-[#d6d1c3] px-[5vw] py-8 text-xs tracking-[0.06em] text-[#6f6a60]"><div className="mx-auto flex max-w-7xl flex-wrap justify-between gap-4"><span>© {new Date().getFullYear()} SIND &amp; SIND</span><span>FREE E-COMMERCE DECISION SUPPORT</span><Link to="/consultant" className="underline hover:text-[#d8321e]">Try the free consultant</Link></div></footer>;
}
