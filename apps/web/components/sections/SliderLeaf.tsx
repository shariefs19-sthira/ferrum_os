"use client"

import { useState } from 'react'

export type SlideItem = {
  title: string
  body: string
}

type SliderLeafProps = {
  items: SlideItem[]
}

export default function SliderLeaf({ items }: SliderLeafProps) {
  const [index, setIndex] = useState(0)
  const item = items[index]

  return (
    <div>
      <div className="rounded-lg border border-relume-border bg-relume-surface p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-relume-ink">
          Step {index + 1} of {items.length}
        </p>
        <h3 className="mt-3 text-xl font-semibold tracking-relume-tight text-relume-ink">{item.title}</h3>
        <p className="mt-3 text-sm leading-6 text-relume-ink">{item.body}</p>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          disabled={index === 0}
          className="rounded-full border border-relume-border px-4 py-2 text-sm font-medium text-relume-ink disabled:opacity-40"
        >
          Previous
        </button>
        <div className="flex gap-2">
          {items.map((slide, i) => (
            <button
              key={slide.title}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Go to step ${i + 1}`}
              className={`h-2 w-2 rounded-full ${i === index ? 'bg-relume-ink' : 'bg-relume-border'}`}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={() => setIndex((i) => Math.min(items.length - 1, i + 1))}
          disabled={index === items.length - 1}
          className="rounded-full border border-relume-border px-4 py-2 text-sm font-medium text-relume-ink disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  )
}
