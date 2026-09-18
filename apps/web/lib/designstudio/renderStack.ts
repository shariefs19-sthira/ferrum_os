export type RenderCapability = {
  id: string
  name: string
  role: string
  runtime: 'BROWSER' | 'CONTROLLED WORKER' | 'OPTIONAL PLUGIN'
  status: 'ACTIVE' | 'NEXT' | 'PLUGIN ONLY'
  license: string
  projectWriteAccess: false
}

/**
 * Ferrum-owned rendering boundary. Proprietary applications are export-only
 * plugins and never form part of the default product or receive write access.
 */
export const designStudioRenderStack: RenderCapability[] = [
  { id: 'three', name: 'Three.js', role: 'Interactive PBR viewport and shell swapping', runtime: 'BROWSER', status: 'ACTIVE', license: 'MIT', projectWriteAccess: false },
  { id: 'three-path', name: 'Three GPU Path Tracer', role: 'Progressive browser beauty preview', runtime: 'BROWSER', status: 'NEXT', license: 'MIT', projectWriteAccess: false },
  { id: 'web-ifc', name: 'web-ifc', role: 'IFC geometry and property ingestion', runtime: 'BROWSER', status: 'ACTIVE', license: 'MPL-2.0', projectWriteAccess: false },
  { id: 'cycles', name: 'Blender Cycles', role: 'Isolated high-resolution render worker', runtime: 'CONTROLLED WORKER', status: 'NEXT', license: 'Apache-2.0 engine', projectWriteAccess: false },
  { id: 'd5-plugin', name: 'D5 export plugin', role: 'Optional user-installed scene handoff', runtime: 'OPTIONAL PLUGIN', status: 'PLUGIN ONLY', license: 'Third-party terms', projectWriteAccess: false },
  { id: 'vray-plugin', name: 'V-Ray export plugin', role: 'Optional user-installed scene handoff', runtime: 'OPTIONAL PLUGIN', status: 'PLUGIN ONLY', license: 'Third-party terms', projectWriteAccess: false },
]
