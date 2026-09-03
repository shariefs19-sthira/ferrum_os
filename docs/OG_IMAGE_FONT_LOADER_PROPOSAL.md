# OG image ImageResponse font-loader proposal

**Status:** proposal only. RIVET does not modify `apps/web/**`; MASON owns
the later implementation target.

## Finding

At the reference revision, there is no tracked `ImageResponse` route and no
checked-in font asset under `apps/web/**`. `next/font/google` produces its
Inter files during the web build, so its generated `.next` paths must not be
used by an edge OG route. They are build artifacts, not deployable source
inputs.

## Proposed implementation

Add one tracked, operator-approved and license-cleared font asset at
`apps/web/app/og/Inter-Bold.ttf`; this is an asset, not a dependency.
Then create `apps/web/app/opengraph-image.tsx` with the following code. The
module-level promise is intentional: it deduplicates the fetch per isolate,
while the `await` ensures `ImageResponse` receives an `ArrayBuffer`, not a
promise.

```tsx
import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const interBold = fetch(new URL('./og/Inter-Bold.ttf', import.meta.url)).then(
  async (response) => {
    if (!response.ok) {
      throw new Error(`OG font failed to load: ${response.status} ${response.statusText}`)
    }

    const font = await response.arrayBuffer()
    if (font.byteLength === 0) {
      throw new Error('OG font loaded as an empty buffer')
    }

    return font
  },
)

export default async function OpenGraphImage() {
  const font = await interBold

  return new ImageResponse(
    (
      <div
        style={{
          alignItems: 'center',
          background: '#FFFFFF',
          color: '#0B1F3A',
          display: 'flex',
          fontFamily: 'Inter',
          fontSize: 72,
          fontWeight: 700,
          height: '100%',
          justifyContent: 'center',
          width: '100%',
        }}
      >
        Ferrum OS
      </div>
    ),
    {
      ...size,
      fonts: [{ data: font, name: 'Inter', weight: 700, style: 'normal' }],
    },
  )
}
```

## Acceptance checks for MASON

1. `pnpm --filter ./apps/web build` completes without an ImageResponse font
   error.
2. Request `/opengraph-image` and confirm `200`, `image/png`, and a nonzero
   body.
3. Confirm the asset path is bundled from source, never `.next/**` or a remote
   URL. No package or lockfile change is required.
