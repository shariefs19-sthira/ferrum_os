type SpecColumn = {
  key: string
  label: string
}

type SpecTableProps = {
  columns: SpecColumn[]
  rows: Record<string, string>[]
  rowKey: string
}

export default function SpecTable({ columns, rows, rowKey }: SpecTableProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-relume-border">
      <table className="min-w-full divide-y divide-gray-200 text-left">
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
  )
}
