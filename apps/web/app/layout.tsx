import './globals.css';
import React from 'react';
import { Navbar } from '../components/Navbar';

export const metadata = {
  title: 'Aftercode - Repository & Video Intelligence Platform',
  description: 'Autonomous Repository Analysis & SaaS Video Production Engine for AI IDEs',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <Navbar />
          <main style={{ flex: 1 }}>{children}</main>
          <footer
            style={{
              borderTop: '1px solid #e2e8f0',
              padding: '20px 32px',
              textAlign: 'center',
              color: '#64748b',
              fontSize: '0.825rem',
              background: '#ffffff',
              marginTop: 'auto',
            }}
          >
            <p>Aftercode Repository & Video Intelligence Platform © 2026 Sameer Bagul.</p>
          </footer>
        </div>
      </body>
    </html>
  );
}
