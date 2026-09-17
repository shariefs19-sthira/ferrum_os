type SpecColumn = {
  key: string
  label: string
}

type SpecTableProps = {
  columns: SpecColumn[]
  rows: Record<string, string>[]
  rowKey: string
}

// W2-503: this is a generic reusable table (arbitrary caller-supplied
// columns/rows — e.g. the Structura beam-size reference is five columns
// wide including a free-text "Typical use" phrase), so a forced min-w
// isn't safe to just drop the way it is on the narrower, fixed-shape
// tables elsewhere in this task. Below `sm`: one labelled card per row
// (each column's `label` becomes the `key: value` prefix, first column
// still styled as the row's heading). At `sm`+: the original real
// <table>, unchanged.
export default function SpecTable({ columns, rows, rowKey }: SpecTableProps) {
  return (
    <div className="rounded-2xl border border-relume-border">
      <ul className="divide-y divide-gray-200 sm:hidden">
        {rows.map((row) => (
          <li key={row[rowKey]} className="space-y-1 px-6 py-4">
            {columns.map((col, i) => (
              <p key={col.key} className={i === 0 ? 'text-sm font-semibold text-relume-ink' : 'text-sm text-relume-muted'}>
                {i === 0 ? row[col.key] : <><span className="font-medium text-relume-ink">{col.label}: </span>{row[col.key]}</>}
              </p>
            ))}
          </li>
        ))}
      </ul>
      <div className="hidden sm:block">
        <table className="w-full divide-y divide-gray-200 text-left">
          <thead className="bg-relume-surface-secondary">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.12em] text-relume-muted"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {rows.map((row) => (
              <tr key={row[rowKey]} className="align-top">
                {columns.map((col, i) => (
                  <td
                    key={col.key}
                    className={
                      i === 0
                        ? 'px-6 py-4 text-sm font-semibold text-relume-ink'
                        : 'px-6 py-4 text-sm text-relume-muted'
                    }
                  >
                    {row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
