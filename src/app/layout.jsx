import './globals.css';

export const metadata = {
  title: 'EquityPulse - Real-Time Stock Screener',
  description: 'Professional Real-Time Stock Screener for the Indian equity market.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
