import Link from 'next/link'
import SectionShell from '../../components/sections/SectionShell'
import SectionHeading from '../../components/sections/SectionHeading'

export default function SignupPage() {
  return (
    <main>
      <SectionShell>
        <div className="mx-auto max-w-md">
          <SectionHeading as="h1" className="text-center">Sign Up</SectionHeading>
          <form className="mt-8 space-y-5">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-relume-ink">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                className="mt-2 w-full rounded-lg border border-relume-border bg-relume-surface px-4 py-3 text-sm text-relume-ink"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-relume-ink">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                className="mt-2 w-full rounded-lg border border-relume-border bg-relume-surface px-4 py-3 text-sm text-relume-ink"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-relume-ink">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                required
                className="mt-2 w-full rounded-lg border border-relume-border bg-relume-surface px-4 py-3 text-sm text-relume-ink"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-full bg-relume-ink px-6 py-3 text-sm font-medium text-white transition hover:opacity-90"
            >
              Sign Up
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-relume-ink">
            Already have an account? <Link href="/login" className="underline underline-offset-4">Log in</Link>
          </p>
        </div>
      </SectionShell>
    </main>
  )
}
