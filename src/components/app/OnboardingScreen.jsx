import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext.jsx';
import { CSV_TEMPLATES, createCanonicalStoreFromCsv } from '../../lib/csvImporter.js';

export default function OnboardingScreen() {
  const { switchToDemoMode, loadTest001Data, importCsvData, connectAmazon } = useData();
  const navigate = useNavigate();

  const [showCsvModal, setShowCsvModal] = useState(false);
  const [csvProductsText, setCsvProductsText] = useState(CSV_TEMPLATES.products);
  const [csvOrdersText, setCsvOrdersText] = useState(CSV_TEMPLATES.orders);
  const [csvInventoryText, setCsvInventoryText] = useState(CSV_TEMPLATES.inventory);
  const [storeInputName, setStoreInputName] = useState('My Commerce Store');
  const [isAuthorizingAmazon, setIsAuthorizingAmazon] = useState(false);

  const handleStartDemo = () => {
    switchToDemoMode();
    navigate('/app');
  };

  const handleLoadTest001 = () => {
    loadTest001Data();
    navigate('/app/products');
  };

  const handleImportCustomCsv = (e) => {
    e.preventDefault();
    const parsedStore = createCanonicalStoreFromCsv({
      productsCsv: csvProductsText,
      ordersCsv: csvOrdersText,
      inventoryCsv: csvInventoryText,
      storeName: storeInputName
    });
    importCsvData(parsedStore, storeInputName);
    setShowCsvModal(false);
    navigate('/app/products');
  };

  const handleConnectAmazonSeller = () => {
    setIsAuthorizingAmazon(true);
    setTimeout(() => {
      setIsAuthorizingAmazon(false);
      navigate('/app/data');
    }, 400);
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 space-y-12">
      {/* 1. HERO ONBOARDING HEADER */}
      <div className="space-y-4 border-b border-[#ded8cb] pb-8">
        <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-[#c5301a]">
          <span>Data Ingestion &amp; Onboarding</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium text-[#141310] tracking-tight">
          Connect your commerce operation
        </h1>
        <p className="font-serif text-lg text-[#45423b] max-w-2xl leading-relaxed">
          Bring your marketplace, store and operating data into Sind &amp; Sind to begin analysing true unit economics, cash exposure, and cross-functional operating constraints.
        </p>
      </div>

      {/* 2. PRIMARY DATA CONNECTION TILES */}
      <div className="space-y-6">
        <h2 className="font-mono text-xs uppercase tracking-wider text-[#6e6a60]">
          Connect a Live Commerce Source
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Amazon Seller Central */}
          <div className="border border-[#ded8cb] bg-white p-6 flex flex-col justify-between hover:border-[#141310] transition-colors space-y-6">
            <div className="space-y-2">
              <span className="font-mono text-[10px] uppercase tracking-wider text-[#c5301a] block">
                3P Marketplace
              </span>
              <h3 className="font-serif text-xl font-medium text-[#141310]">
                Amazon Seller Central
              </h3>
              <p className="font-mono text-xs text-[#6e6a60] leading-relaxed">
                Orders · Inventory · Financials · Fulfilment via official SP-API &amp; LWA OAuth 2.0.
              </p>
            </div>
            <button
              onClick={handleConnectAmazonSeller}
              className="button-primary text-xs w-full text-center"
            >
              {isAuthorizingAmazon ? 'Initiating OAuth...' : 'Connect Seller Central →'}
            </button>
          </div>

          {/* Shopify */}
          <div className="border border-[#ded8cb] bg-white p-6 flex flex-col justify-between hover:border-[#141310] transition-colors space-y-6">
            <div className="space-y-2">
              <span className="font-mono text-[10px] uppercase tracking-wider text-[#1b7340] block">
                DTC Storefront
              </span>
              <h3 className="font-serif text-xl font-medium text-[#141310]">
                Shopify DTC
              </h3>
              <p className="font-mono text-xs text-[#6e6a60] leading-relaxed">
                Orders · Products · Inventory · Fulfilment webhooks and store API tokens.
              </p>
            </div>
            <Link
              to="/app/data"
              className="button-secondary text-xs w-full text-center"
            >
              Connect Shopify →
            </Link>
          </div>

          {/* Amazon Vendor Central */}
          <div className="border border-[#ded8cb] bg-white p-6 flex flex-col justify-between hover:border-[#141310] transition-colors space-y-6">
            <div className="space-y-2">
              <span className="font-mono text-[10px] uppercase tracking-wider text-[#6e6a60] block">
                1P Wholesale
              </span>
              <h3 className="font-serif text-xl font-medium text-[#141310]">
                Amazon Vendor Central
              </h3>
              <p className="font-mono text-xs text-[#6e6a60] leading-relaxed">
                Purchase Orders · Direct Fulfilment · Invoices &amp; wholesale settlement remittance.
              </p>
            </div>
            <Link
              to="/app/data"
              className="button-secondary text-xs w-full text-center"
            >
              Configure Vendor 1P →
            </Link>
          </div>
        </div>
      </div>

      {/* 3. CSV / ERP FILE INGESTION */}
      <div className="border border-[#ded8cb] bg-[#f8f6f0] p-6 sm:p-8 space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1 max-w-xl">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#6e6a60] block">
              Standardized File Ingestion
            </span>
            <h3 className="font-serif text-2xl font-medium text-[#141310]">
              Import CSV / ERP Operating Data
            </h3>
            <p className="text-sm font-sans text-[#45423b] leading-relaxed">
              Upload standard tables for Products, Orders, Inventory, and Suppliers without requiring live marketplace API credentials.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setShowCsvModal(true)}
              className="button-primary text-xs"
            >
              Paste / Import CSV →
            </button>
            <button
              onClick={handleLoadTest001}
              className="button-secondary text-xs"
              title="Loads a 1-SKU custom verification dataset (TEST-001) to verify complete data isolation"
            >
              Quick Test (TEST-001)
            </button>
          </div>
        </div>
      </div>

      {/* 4. EXPLORE DEMO MODE */}
      <div className="border-t border-[#ded8cb] pt-8 flex flex-wrap items-center justify-between gap-6">
        <div className="space-y-1">
          <span className="font-mono text-[11px] uppercase tracking-wider text-[#6e6a60] block">
            Want to explore the product first?
          </span>
          <h4 className="font-serif text-lg font-medium text-[#141310]">
            Atelier &amp; Co. · Curated Demo Store
          </h4>
          <p className="font-mono text-xs text-[#6e6a60]">
            Explore 10 SKUs, 140 synthetic orders, multi-warehouse logistics, and deterministic finding engines.
          </p>
        </div>

        <button
          onClick={handleStartDemo}
          className="button-secondary text-xs hover:border-[#141310]"
        >
          Enter Demo Mode →
        </button>
      </div>

      {/* CSV MODAL */}
      {showCsvModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#fcfbf8] border border-[#ded8cb] max-w-2xl w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#ded8cb] pb-4">
              <div>
                <h3 className="font-serif text-2xl font-medium text-[#141310]">
                  Import Commerce CSV Data
                </h3>
                <p className="font-mono text-xs text-[#6e6a60]">
                  Paste CSV contents or edit the canonical starter templates below.
                </p>
              </div>
              <button
                onClick={() => setShowCsvModal(false)}
                className="font-mono text-xs text-[#6e6a60] hover:text-[#141310]"
              >
                ✕ Close
              </button>
            </div>

            <form onSubmit={handleImportCustomCsv} className="space-y-4 font-mono text-xs">
              <div>
                <label className="block text-[#6e6a60] mb-1">Store / Organization Name</label>
                <input
                  type="text"
                  value={storeInputName}
                  onChange={(e) => setStoreInputName(e.target.value)}
                  className="w-full bg-white border border-[#ded8cb] p-2 text-xs text-[#141310]"
                  required
                />
              </div>

              <div>
                <label className="block text-[#6e6a60] mb-1">1. Products CSV</label>
                <textarea
                  rows={4}
                  value={csvProductsText}
                  onChange={(e) => setCsvProductsText(e.target.value)}
                  className="w-full bg-white border border-[#ded8cb] p-2 font-mono text-[11px] text-[#141310]"
                  required
                />
              </div>

              <div>
                <label className="block text-[#6e6a60] mb-1">2. Orders CSV</label>
                <textarea
                  rows={4}
                  value={csvOrdersText}
                  onChange={(e) => setCsvOrdersText(e.target.value)}
                  className="w-full bg-white border border-[#ded8cb] p-2 font-mono text-[11px] text-[#141310]"
                  required
                />
              </div>

              <div>
                <label className="block text-[#6e6a60] mb-1">3. Inventory Positions CSV</label>
                <textarea
                  rows={3}
                  value={csvInventoryText}
                  onChange={(e) => setCsvInventoryText(e.target.value)}
                  className="w-full bg-white border border-[#ded8cb] p-2 font-mono text-[11px] text-[#141310]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#ded8cb]">
                <button
                  type="button"
                  onClick={() => setShowCsvModal(false)}
                  className="button-secondary text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="button-primary text-xs"
                >
                  Parse &amp; Load into Console →
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
