// Server/test-only companion to ifc-export.ts: parses an exported IFC file
// back via the real `web-ifc` WASM parser to sanity-check element counts.
//
// Kept out of ifc-export.ts because getWebIfc() below forces Node's
// CommonJS require condition via a dynamic `import('module')` - bundling
// that into the browser client build fails with "Module not found: Can't
// resolve 'module'", even though the call path never actually runs in the
// browser, because webpack/Turbopack statically resolves every
// import()/require() call it finds while bundling a module graph a client
// component pulls in. Never import this file from a "use client" component
// - only from server/test code (vitest, API routes).

import type { GeometryCounts } from './ifc-export'

type IfcAPIType = import('web-ifc').IfcAPI

/**
 * Parses IFC bytes back via web-ifc and counts the four element types
 * exportMassingToIfc() produces. Used by the round-trip test; also usable
 * as a general "does this look like a real IFC file" sanity check.
 */
export async function countIfcGeometry(bytes: Uint8Array): Promise<GeometryCounts> {
  const { IfcAPI, IFCWALLSTANDARDCASE, IFCSLAB, IFCSPACE, IFCOPENINGELEMENT } = await getWebIfc()
  const api: IfcAPIType = new IfcAPI()
  await api.Init()
  try {
    const modelID = api.OpenModel(bytes)
    if (modelID < 0) throw new Error('web-ifc failed to open the exported model')
    const counts: GeometryCounts = {
      walls: api.GetLineIDsWithType(modelID, IFCWALLSTANDARDCASE).size(),
      slabs: api.GetLineIDsWithType(modelID, IFCSLAB).size(),
      spaces: api.GetLineIDsWithType(modelID, IFCSPACE).size(),
      openings: api.GetLineIDsWithType(modelID, IFCOPENINGELEMENT).size(),
    }
    api.CloseModel(modelID)
    return counts
  } finally {
    api.Dispose?.()
  }
}

// web-ifc ships separate node/browser entry points behind package.json's
// "exports" map (require -> web-ifc-api-node.js, import -> the browser
// build, which tries to fetch its .wasm by URL and does not work under
// plain Node/Workers). Force the "require" condition via createRequire so
// this resolves to the Node build regardless of how this module itself
// was imported (CJS test runner or ESM).
async function getWebIfc() {
  const { createRequire } = await import('module')
  const require = createRequire(import.meta.url)
  return require('web-ifc') as typeof import('web-ifc')
}
