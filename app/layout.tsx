import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Игра Фразеологизмов',
  description: 'Угадайте значение выдуманных фразеологизмов',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <body>
        <div className="min-h-screen bg-gray-50">
          {children}
        </div>
      </body>
    </html>
  )
}