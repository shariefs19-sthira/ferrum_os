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
        <details key={faq.question} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <summary className="cursor-pointer list-none text-base font-semibold text-slate-900 marker:content-none">
            <span className="mr-3 inline-flex rounded-full bg-blue-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-blue-700 align-middle">
              {faq.category}
            </span>
            {faq.question}
          </summary>
          <p className="mt-3 text-sm leading-7 text-slate-600">{faq.answer}</p>
        </details>
      ))}
    </div>
  )
}
