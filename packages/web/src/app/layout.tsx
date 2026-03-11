import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    default: 'FlipFlow Forms — Build High-Converting Lead Forms',
    template: '%s | FlipFlow Forms',
  },
  description:
    'Build high-converting multi-step lead forms in minutes. Conditional logic, A/B testing, and powerful integrations for Solar, Insurance, Mortgage, and more.',
  keywords: [
    'lead forms',
    'form builder',
    'multi-step forms',
    'lead generation',
    'A/B testing',
    'solar leads',
    'insurance leads',
    'mortgage leads',
  ],
  openGraph: {
    title: 'FlipFlow Forms — Build High-Converting Lead Forms',
    description:
      'Build high-converting multi-step lead forms in minutes. Conditional logic, A/B testing, and powerful integrations.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style
          dangerouslySetInnerHTML={{
            __html: `
              *, *::before, *::after {
                box-sizing: border-box;
                margin: 0;
                padding: 0;
              }
              html {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
                  'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6;
                color: #1a1a1a;
                -webkit-font-smoothing: antialiased;
                -moz-osx-font-smoothing: grayscale;
              }
              body {
                min-height: 100vh;
              }
              a {
                color: inherit;
                text-decoration: none;
              }
              img {
                max-width: 100%;
                display: block;
              }
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
