import './globals.css';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';

export const metadata = {
  title: 'ChainTrust — Institutional Public Ledger',
  description: 'Blockchain-powered fund tracking and fraud detection for government projects. Every rupee tracked, every transaction sealed.',
  keywords: 'blockchain, public fund tracking, fraud detection, transparency, government, anti-corruption',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
        <div className="app-layout">
          <Sidebar />
          <div className="main-area">
            <TopBar />
            <main>{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
