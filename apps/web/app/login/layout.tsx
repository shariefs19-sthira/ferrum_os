import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Login - Ferrum OS',
  description: 'Sign in to Ferrum OS to manage projects, land intelligence, and execution workflows from one place.',
  openGraph: {
    title: 'Login - Ferrum OS',
    description: 'Sign in to Ferrum OS to manage projects, land intelligence, and execution workflows from one place.',
    type: 'website',
    locale: 'en_US',
  },
}

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}