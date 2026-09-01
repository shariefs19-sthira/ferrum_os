import Link from 'next/link'

export type CardItem = {
  title: string
  body: string
  href?: string
  linkLabel?: string
}

type CardGridProps = {
  items: CardItem[]
  columns?: 2 | 3 | 4
}

const columnClass: Record<number, string> = {
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-2 lg:grid-cols-3',
  4: 'sm:grid-cols-2 lg:grid-cols-4',
}

export default function CardGrid({ items, columns = 3 }: CardGridProps) {
  return (
    <div className={`grid grid-cols-1 gap-6 ${columnClass[columns]}`}>
      {items.map((item) => (
        <div
          key={item.title}
          className="rounded-lg border border-relume-border bg-relume-surface p-6 transition hover:-translate-y-0.5"
        >
          <h3 className="text-lg font-semibold tracking-relume-tight text-relume-ink">{item.title}</h3>
          <p className="mt-3 text-sm leading-6 text-relume-ink">{item.body}</p>
          {item.href && (
            <Link
              href={item.href}
              className="mt-4 inline-block text-sm font-medium text-relume-ink underline underline-offset-4"
            >
              {item.linkLabel ?? 'Learn more'}
            </Link>
          )}
        </div>
      ))}
    </div>
  )
}
