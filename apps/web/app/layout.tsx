import './globals.css'
import NewsletterSignup from '../components/NewsletterSignup'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen bg-slate-50">{children}</div>
        <NewsletterSignup />
      </body>
    </html>
  )
}

