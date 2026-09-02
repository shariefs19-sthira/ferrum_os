type FaqItem = {
  category: string
  question: string
  answer: string
}

type FaqAccordionProps = {
  faqs: FaqItem[]
}

export default function FaqAccordion({ faqs }: FaqAccordionProps) {
  return (
    <div className="space-y-4">
      {faqs.map((faq) => (
        <details key={faq.question} className="rounded-2xl border border-relume-border bg-white p-5">
          <summary className="cursor-pointer list-none text-base font-semibold text-relume-ink marker:content-none">
            <span className="mr-3 inline-flex rounded-full bg-relume-surface-secondary px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-relume-ink align-middle">
              {faq.category}
            </span>
            {faq.question}
          </summary>
          <p className="mt-3 text-sm leading-7 text-relume-muted">{faq.answer}</p>
        </details>
      ))}
    </div>
  )
}
