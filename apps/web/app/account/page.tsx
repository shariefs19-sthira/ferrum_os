"use client"

import CommandDeck from "../../components/CommandDeck"

export default function AccountPage() {
  return (
    <main>
      <div className="border-b border-relume-border bg-orange-50 px-6 py-3 text-center text-xs font-semibold uppercase tracking-[0.14em] text-relume-command">
        PREVIEW — no account or cloud session is created
      </div>
      <CommandDeck />
    </main>
  )
}
