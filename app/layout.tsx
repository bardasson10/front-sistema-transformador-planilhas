import type { Metadata } from 'next'

import { Analytics } from '@vercel/analytics/next'
import './globals.css'

import { Quicksand as V0_Font_Quicksand, IBM_Plex_Mono as V0_Font_IBM_Plex_Mono, Libre_Baskerville as V0_Font_Libre_Baskerville } from 'next/font/google'
import { UploadsProvider } from '@/components/uploads/uploads-context'

// Initialize fonts
const _quicksand = V0_Font_Quicksand({ subsets: ['latin'], weight: ["300","400","500","600","700"] })
const _ibmPlexMono = V0_Font_IBM_Plex_Mono({ subsets: ['latin'], weight: ["100","200","300","400","500","600","700"] })
const _libreBaskerville = V0_Font_Libre_Baskerville({ subsets: ['latin'], weight: ["400","700"] })

export const metadata: Metadata = {
  title: 'DataFlow - Gestão de Dados',
  description: 'Plataforma profissional para transformação e gestão de dados',
  generator: 'v0.app',
  icons: {
    icon: [
      // {
      //   url: '/icon-light-32x32.png',
      //   media: '(prefers-color-scheme: light)',
      // },
      // {
      //   url: '/icon-dark-32x32.png',
      //   media: '(prefers-color-scheme: dark)',
      // },
      {
        url: '/database.png',
        type: 'image/png',
      },
    ],
    // apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <body className={`font-sans antialiased`}>
        <UploadsProvider>
          {children}
        </UploadsProvider>
        <Analytics />
      </body>
    </html>
  )
}

