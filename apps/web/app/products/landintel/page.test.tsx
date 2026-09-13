import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

describe('LandIntel hero composition', () => {
  const source = readFileSync(resolve(process.cwd(), 'app/products/landintel/page.tsx'), 'utf8')

  it('puts the context rail ahead of the lookup and uses the page-width cockpit mode', () => {
    expect(source.indexOf('data-landintel-context-rail')).toBeLessThan(source.indexOf('<UlpinMapExplorer />'))
    expect(source).toContain('layout="product-page"')
    expect(source).toContain('data-landintel-working-row')
    expect(source).not.toContain('max-w-[1728px]')
    expect(source).not.toContain('order-first min-w-0 lg:order-none')
  })
})
