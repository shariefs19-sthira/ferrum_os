import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign Up - Ferrum OS',
  description: 'Create your Ferrum OS account and start trial to manage real estate and construction projects.',
  openGraph: {
    title: 'Sign Up - Ferrum OS',
    description: 'Create your Ferrum OS account and start trial to manage real estate and construction projects.',
    type: 'website',
    locale: 'en_US',
  },
}

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}