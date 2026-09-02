import Link from "next/link";
import ReadingProgress from "../../../../components/ReadingProgress";

export default function BlogArticleTemplatePage() {
  return (
    <main className="min-h-screen bg-relume-surface-secondary text-relume-ink">
      <ReadingProgress />
      <section className="bg-gradient-to-r from-blue-700 via-indigo-700 to-violet-700 px-4 py-20 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/70">Ferrum OS</p>
          <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
            {/* Title goes here */}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-white/70">
            {/* Subtitle/Description goes here */}
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link href="/resources/blog" className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-relume-ink transition hover:bg-relume-surface-secondary">
              Back to Blog
            </Link>
          </div>
        </div>
      </section>

      <article className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="prose prose-slate max-w-none">
          {/* Introduction */}
          <p>
            {/* Introductory paragraph */}
          </p>

          {/* Main Content Sections */}
          <h2>Section Heading 1</h2>
          <p>
            {/* Content for section 1 */}
          </p>

          <h2>Section Heading 2</h2>
          <p>
            {/* Content for section 2 */}
          </p>

          <h2>Section Heading 3</h2>
          <p>
            {/* Content for section 3 */}
          </p>

          {/* Conclusion */}
          <h2>Conclusion</h2>
          <p>
            {/* Concluding remarks */}
          </p>
        </div>
      </article>
    </main>
  );
}