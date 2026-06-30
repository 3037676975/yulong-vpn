export const metadata = {
  title: '玉龙管理后台',
  description: 'Yulong admin dashboard'
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
