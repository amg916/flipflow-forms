import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FlipFlow Forms',
  description: 'High-performance multi-step lead form builder',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
