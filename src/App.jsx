giimport { Route, Routes } from 'react-router-dom';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import Home from './pages/Home.jsx';
import Expertise from './pages/Expertise.jsx';
import ExpertiseDetail from './pages/ExpertiseDetail.jsx';
import Insights from './pages/Insights.jsx';
import Consultant from './pages/Consultant.jsx';
import About from './pages/About.jsx';
export default function App() {
  return (
    <div className="flex min-h-screen flex-col justify-between bg-[#fcfbf8] text-[#141310] selection:bg-[#c5301a] selection:text-white">
      <Header />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/expertise" element={<Expertise />} />
          <Route path="/expertise/:slug" element={<ExpertiseDetail />} />
          <Route path="/insights" element={<Insights />} />
          <Route path="/consultant" element={<Consultant />} />
          <Route path="/about" element={<About />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
