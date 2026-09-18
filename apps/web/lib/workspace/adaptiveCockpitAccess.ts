export type CockpitAccessPath = {
  feature: string
  compactAccess: string
  wideAccess: string
  blocksCanvasByDefault: false
}

/**
 * Acceptance inventory for the adaptive cockpit. Every major desktop task
 * remains discoverable on compact viewports without becoming a persistent
 * canvas overlay. Keep this list aligned with the labelled controls rendered
 * by WorkspaceCockpit and the project-workspace shell.
 */
export const adaptiveCockpitAccess: CockpitAccessPath[] = [
  { feature: 'model-view', compactAccess: '3D space tab', wideAccess: 'Model view toolbar', blocksCanvasByDefault: false },
  { feature: 'building-library', compactAccess: 'Shells task sheet', wideAccess: 'Shells task panel', blocksCanvasByDefault: false },
  { feature: 'parameters', compactAccess: 'Controls task sheet', wideAccess: 'Controls task panel', blocksCanvasByDefault: false },
  { feature: 'guided-options', compactAccess: 'Options task sheet', wideAccess: 'Options task panel', blocksCanvasByDefault: false },
  { feature: 'evidence', compactAccess: 'Evidence task sheet', wideAccess: 'Evidence task panel', blocksCanvasByDefault: false },
  { feature: 'render-mode', compactAccess: 'Canvas status toolbar', wideAccess: 'Canvas status toolbar', blocksCanvasByDefault: false },
  { feature: 'product-switching', compactAccess: 'Product picker', wideAccess: 'Product rail', blocksCanvasByDefault: false },
  { feature: 'workspace-tools', compactAccess: 'Tools toolbar', wideAccess: 'Tools rail', blocksCanvasByDefault: false },
  { feature: 'sutra', compactAccess: 'SUTRA button and dismissible sheet', wideAccess: 'SUTRA dock', blocksCanvasByDefault: false },
  { feature: 'territory', compactAccess: 'Territory button and dismissible sheet', wideAccess: 'Territory task panel', blocksCanvasByDefault: false },
  { feature: 'data-extract', compactAccess: 'Data button and dismissible sheet', wideAccess: 'Data extract task panel', blocksCanvasByDefault: false },
  { feature: 'permalink', compactAccess: 'Copy button', wideAccess: 'Copy view link button', blocksCanvasByDefault: false },
  { feature: 'fullscreen', compactAccess: 'Workspace button', wideAccess: 'Open in workspace button', blocksCanvasByDefault: false },
]
