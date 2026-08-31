import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Formwork Pressure Calculation for Wall and Column Pours - Ferrum OS',
  description: 'Getting the design pressure right before you spec formwork: how pour rate, concrete temperature, and mix design change lateral pressure, and why to margin the calculation instead of guessing.',
  openGraph: {
    title: 'Formwork Pressure Calculation for Wall and Column Pours - Ferrum OS',
    description: 'Getting the design pressure right before you spec formwork: how pour rate, concrete temperature, and mix design change lateral pressure, and why to margin the calculation instead of guessing.',
    type: 'article',
    locale: 'en_US',
  },
}

export default function FormworkPressureCalculationLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
