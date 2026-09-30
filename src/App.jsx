import { Route, Routes } from 'react-router-dom';
import { DataProvider } from './context/DataContext.jsx';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import Home from './pages/Home.jsx';
import Expertise from './pages/Expertise.jsx';
import ExpertiseDetail from './pages/ExpertiseDetail.jsx';
import Insights from './pages/Insights.jsx';
import Consultant from './pages/Consultant.jsx';
import About from './pages/About.jsx';

import AppShell from './components/app/AppShell.jsx';
import OverviewPage from './pages/app/OverviewPage.jsx';
import ProductsPage from './pages/app/ProductsPage.jsx';
import ProductDetailPage from './pages/app/ProductDetailPage.jsx';
import EconomicsPage from './pages/app/EconomicsPage.jsx';
import MarketplacesPage from './pages/app/MarketplacesPage.jsx';
import ChannelDetailPage from './pages/app/ChannelDetailPage.jsx';
import PricingPage from './pages/app/PricingPage.jsx';
import PricingDetailPage from './pages/app/PricingDetailPage.jsx';
import WorkingCapitalPage from './pages/app/WorkingCapitalPage.jsx';
import CashDetailPage from './pages/app/CashDetailPage.jsx';
import SignalsPage from './pages/app/SignalsPage.jsx';
import SignalDetailPage from './pages/app/SignalDetailPage.jsx';
import OperationsPage from './pages/app/OperationsPage.jsx';
import DecisionsPage from './pages/app/DecisionsPage.jsx';
import DataPage from './pages/app/DataPage.jsx';
import SettingsPage from './pages/app/SettingsPage.jsx';

function PublicLayout({ children }) {
  return (
    <div className="flex min-h-screen flex-col justify-between bg-[#fcfbf8] text-[#141310] selection:bg-[#c5301a] selection:text-white">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <DataProvider>
      <Routes>
        {/* Platform Console Routes */}
        <Route path="/app" element={<AppShell />}>
          <Route index element={<OverviewPage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="products/:sku" element={<ProductDetailPage />} />
          <Route path="economics" element={<EconomicsPage />} />
          <Route path="marketplaces" element={<MarketplacesPage />} />
          <Route path="marketplaces/:channelId" element={<ChannelDetailPage />} />
          <Route path="pricing" element={<PricingPage />} />
          <Route path="pricing/:sku" element={<PricingDetailPage />} />
          <Route path="cash" element={<WorkingCapitalPage />} />
          <Route path="cash/:sku" element={<CashDetailPage />} />
          <Route path="operations/cash" element={<WorkingCapitalPage />} />
          <Route path="signals" element={<SignalsPage />} />
          <Route path="signals/:signalId" element={<SignalDetailPage />} />
          <Route path="operations" element={<OperationsPage />} />
          <Route path="decisions" element={<DecisionsPage />} />
          <Route path="data" element={<DataPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>


        {/* Public Editorial Site Routes */}
        <Route
          path="/"
          element={
            <PublicLayout>
              <Home />
            </PublicLayout>
          }
        />
        <Route
          path="/expertise"
          element={
            <PublicLayout>
              <Expertise />
            </PublicLayout>
          }
        />
        <Route
          path="/expertise/:slug"
          element={
            <PublicLayout>
              <ExpertiseDetail />
            </PublicLayout>
          }
        />
        <Route
          path="/insights"
          element={
            <PublicLayout>
              <Insights />
            </PublicLayout>
          }
        />
        <Route
          path="/consultant"
          element={
            <PublicLayout>
              <Consultant />
            </PublicLayout>
          }
        />
        <Route
          path="/about"
          element={
            <PublicLayout>
              <About />
            </PublicLayout>
          }
        />
        <Route
          path="*"
          element={
            <PublicLayout>
              <Home />
            </PublicLayout>
          }
        />
      </Routes>
    </DataProvider>
  );
}
