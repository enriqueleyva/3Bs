import './globals.css';

export const metadata = {
  title: 'Registro de productos',
  description: 'Autocomplete + registro hacia Google Apps Script',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        {children}
      </body>
    </html>
  );
}
