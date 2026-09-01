"use client"

import { useState } from 'react'

export type AccordionItem = {
  question: string
  answer: string
}

type AccordionLeafProps = {
  items: AccordionItem[]
}

export default function AccordionLeaf({ items }: AccordionLeafProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <div className="divide-y divide-relume-border rounded-lg border border-relume-border">
      {items.map((item, index) => {
        const isOpen = openIndex === index
        return (
          <div key={item.question}>
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : index)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between px-6 py-5 text-left"
            >
              <span className="text-base font-semibold text-relume-ink">{item.question}</span>
              <span className="ml-4 text-relume-ink">{isOpen ? '−' : '+'}</span>
            </button>
            {isOpen && (
              <div className="px-6 pb-5 text-sm leading-6 text-relume-ink">{item.answer}</div>
            )}
          </div>
        )
      })}
    </div>
  )
}
