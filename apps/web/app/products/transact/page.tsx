import SectionShell from '../../../components/sections/SectionShell'
import Eyebrow from '../../../components/sections/Eyebrow'
import SectionHeading from '../../../components/sections/SectionHeading'
import CardGrid from '../../../components/sections/CardGrid'
import AccordionLeaf from '../../../components/sections/AccordionLeaf'
import StampDutyEstimator from '../../../components/sections/StampDutyEstimator'
import AskBandEstimator from '../../../components/sections/AskBandEstimator'
import WaitlistCapture from '../../../components/sections/WaitlistCapture'
import OcrSpike from '../../../components/sections/OcrSpike'
import TransactCaseFlow from '../../../components/sections/TransactCaseFlow'
import PaymentDemo from '../../../components/sections/PaymentDemo'

export const metadata = {
  title: 'Transact — Ferrum OS',
  description: 'Indicative stamp-duty and ask-band estimation tools for property transactions. Informational only — not legal, tax, or financial advice.',
}

const featureItems = [
  { title: 'Stamp-duty estimator', body: 'Indicative stamp duty and registration fee, state-wise, from illustrative sample rates.' },
  { title: 'Ask-band estimator', body: 'An indicative price range from sample comparable data, adjusted by an urgency slider.' },
  { title: 'Demand-token waitlist', body: 'Register interest in Transact — a signal, not a commitment or a queue position.' },
  { title: 'Buyer & seller case flow', body: 'A step-by-step case tracker for both sides — legal cross-check, token payment (test mode), and listing/registration steps.' },
]

const howItWorksSteps = [
  { title: 'Estimate', body: 'Run the stamp-duty and ask-band tools for an indicative starting point.' },
  { title: 'Verify', body: 'Confirm figures with your sub-registrar office or a licensed advocate before relying on them.' },
  { title: 'Join the waitlist', body: 'Register interest in what Transact becomes next — no commitment either way.' },
]

const faqItems = [
  {
    question: 'Is Transact a legal opinion or legal advice?',
    answer: 'No. Every figure on this page is labeled INDICATIVE and is a due-diligence aid, not a legal opinion, title insurance, or legal advice. For a legal opinion, work with a licensed advocate.',
  },
  {
    question: 'Does Ferrum OS collect stamp duty or registration fees?',
    answer: 'No. Stamp duty and registration fees are paid by you directly to the government. Ferrum OS does not collect, hold, or process these payments.',
  },
  {
    question: 'Does joining the waitlist guarantee anything?',
    answer: 'No. Joining records your interest only. It does not imply a commitment on either side, priority allocation, or an investment return.',
  },
  {
    question: 'Where do the stamp-duty rates come from?',
    answer: 'The rates shown are illustrative sample figures, not current government-published rates. Always verify with your local sub-registrar office before relying on any number here.',
  },
  {
    question: 'Does the case flow tracker move real money?',
    answer: 'No. The token payment step is test mode only — no live payment integration exists yet, and no funds move. It exists to demonstrate the process end to end.',
  },
]

export default function TransactPage() {
  return (
    <main>
      {/* 1. Hero */}
      <SectionShell>
        <div className="grid gap-10 md:grid-cols-2 md:items-center">
          <div>
            <Eyebrow>Transact</Eyebrow>
            <SectionHeading as="h1" className="mt-4">
              Indicative estimates for your next property transaction
            </SectionHeading>
            <p className="mt-6 text-base leading-7 text-relume-ink">
              Stamp-duty and ask-band estimates to help you plan — informational only, not legal or financial advice.
            </p>
          </div>
          <div className="order-first md:order-none">
            <StampDutyEstimator />
          </div>
        </div>
      </SectionShell>

      {/* 2. Features */}
      <SectionShell background="surface-secondary">
        <div className="mx-auto max-w-3xl text-center">
          <Eyebrow>Features</Eyebrow>
          <SectionHeading className="mt-4">What Transact offers today</SectionHeading>
        </div>
        <div className="mt-12">
          <CardGrid items={featureItems} columns={3} />
        </div>
      </SectionShell>

      {/* 3. How It Works */}
      <SectionShell>
        <div className="mx-auto max-w-3xl text-center">
          <Eyebrow>How it works</Eyebrow>
          <SectionHeading className="mt-4">Estimate, verify, register interest</SectionHeading>
        </div>
        <div className="mt-12">
          <CardGrid items={howItWorksSteps} columns={3} />
        </div>
      </SectionShell>

      {/* 4. Compliance & disclaimers */}
      <SectionShell background="surface-secondary">
        <div className="mx-auto max-w-3xl">
          <Eyebrow>Read before you use these tools</Eyebrow>
          <SectionHeading className="mt-4">What Transact is — and isn&apos;t</SectionHeading>
          <ul className="mt-6 space-y-3 text-sm leading-6 text-relume-ink">
            <li>Every estimate is INDICATIVE — not a legal opinion, not title insurance, not a guarantee.</li>
            <li>Ferrum OS is a facilitator, not a legal practitioner. It does not give legal, tax, or financial advice.</li>
            <li>Stamp duty and registration fees are paid by you directly to the government — Ferrum OS never collects or holds these funds.</li>
            <li>No commission, pricing claim, or brokerage service is offered on this page.</li>
          </ul>
        </div>
      </SectionShell>

      {/* 5. Try it */}
      <SectionShell>
        <div className="mx-auto max-w-3xl text-center">
          <Eyebrow>Try it</Eyebrow>
          <SectionHeading className="mt-4">Run an indicative estimate</SectionHeading>
        </div>
        <div className="mx-auto mt-8 max-w-2xl space-y-8">
          {/* W2-373 INTERACTION_FIRST: StampDutyEstimator now lives in the
              hero above — no second render of the same tool here. */}
          <AskBandEstimator />
          <OcrSpike />
          <TransactCaseFlow />
          <PaymentDemo />
        </div>
      </SectionShell>

      {/* 6. FAQ */}
      <SectionShell background="surface-secondary">
        <div className="mx-auto max-w-3xl text-center">
          <Eyebrow>FAQ</Eyebrow>
          <SectionHeading className="mt-4">Transact questions, answered</SectionHeading>
        </div>
        <div className="mx-auto mt-12 max-w-2xl">
          <AccordionLeaf items={faqItems} />
        </div>
      </SectionShell>

      {/* 7. CTA — waitlist, not a free trial (no product to trial yet) */}
      <SectionShell>
        <div className="mx-auto max-w-2xl text-center">
          <Eyebrow>Register interest</Eyebrow>
          <SectionHeading className="mt-4">Join the Transact waitlist</SectionHeading>
          <p className="mt-6 text-base leading-7 text-relume-ink">
            No commitment. We&apos;ll let you know as Transact develops.
          </p>
        </div>
        <div className="mx-auto mt-8 max-w-xl">
          <WaitlistCapture />
        </div>
      </SectionShell>
    </main>
  )
}
