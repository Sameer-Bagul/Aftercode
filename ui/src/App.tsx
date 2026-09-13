import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { DashboardPage } from './pages/DashboardPage';
import { ProjectDetailPage } from './pages/ProjectDetailPage';
import { AnalyticsPage } from './pages/AnalyticsPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#fafaf9' }}>
        <Navbar />

        <div style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/project/:slug" element={<ProjectDetailPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
          </Routes>
        </div>

        {/* FOOTER */}
        <footer style={{ borderTop: '1px solid #e5e7eb', padding: '24px 40px', textAlign: 'center', color: '#6b7280', fontSize: '0.875rem', background: '#ffffff', marginTop: 'auto' }}>
          <p>Aftercode Portfolio CMS Engine © 2026 Sameer Bagul. Open-Source Developer Intelligence.</p>
        </footer>
      </div>
    </BrowserRouter>
  );
};
