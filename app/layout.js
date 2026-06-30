import './globals.css';

export const metadata = {
  title: '玉龙VPN 管理后台',
  description: 'Yulong VPN admin dashboard'
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
