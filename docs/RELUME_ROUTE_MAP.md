# RELUME ROUTE MAP (conductor-authored, 2026-08-31)
Canonical new marketing routes (manifest wins):
- /products/<slug> for the 9 product marketing pages (landintel,
designstudio, structura, boq-pro, promarket, buildos, procurehub,
investflow, communitybuild)
- /products/boq-pro = marketing page; the /boq-pro app page stays PROTECTED
- /about/careers (was /careers); /blog = index over /resources/blog/**;
/resources/is-code-guides = guides hub (articles move, 301 old paths)
301 via public/_redirects (static export; no next.config redirects):
each old top-level product slug → /products/<slug>; /careers →
/about/careers; /partners → /about; /faq → /pricing; /resources/guides(/**)
→ /resources/is-code-guides(same)
KEEP as-is: /contact /privacy /terms + /resources/** content tree (blog,
checklists, case-studies, whitepapers, events).
Tokens = Relume defaults (monochrome #070707/#161616, Inter, semibold tight
headings, uppercase semibold taglines, bordered secondaries, outlined
icons) → tailwind.config extend.