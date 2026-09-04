// Shared DOM CustomEvent name so components that save workspace
// artifacts (SaveToWorkspaceButton) and components that list them
// (SavedArtifactsPanel) can stay decoupled - they may or may not be
// mounted on the same route, so a window-level event is the only
// coordination point that works in both cases without introducing a
// global store.
export const ARTIFACT_SAVED_EVENT = "ferrum:artifact-saved"
