import { NavLink } from 'react-router-dom';
const navLinkClass = ({ isActive }) => `text-xs tracking-[0.14em] uppercase transition-colors ${isActive ? 'text-[#d8321e]' : 'text-[#1b1914] hover:text-[#d8321e]'}`;
export default function Header() {
  return <header className="border-y-[3px] border-[#1b1914] bg-[#f6f4ee] px-[5vw] py-5"><div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-6">
    <NavLink to="/" aria-label="Sind & Sind home" className="logo-frame block w-44 sm:w-52"><img src="/sind-and-sind-logo.png" alt="Sind & Sind" className="logo-image" /></NavLink>
    <nav aria-label="Main navigation" className="flex flex-wrap items-center justify-end gap-x-5 gap-y-3"><NavLink to="/expertise" className={navLinkClass}>Expertise</NavLink><NavLink to="/insights" className={navLinkClass}>Insights</NavLink><NavLink to="/consultant" className={navLinkClass}>Free consultant</NavLink><NavLink to="/about" className={navLinkClass}>How it works</NavLink></nav>
  </div></header>;
}
