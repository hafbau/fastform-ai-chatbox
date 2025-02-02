declare module '*.svelte' {
  import type { SvelteComponent } from 'svelte'
  const content: typeof SvelteComponent
  export default content
}

export interface WidgetInstance extends SvelteComponent {
  $set: (props: any) => void
  $destroy: () => void
  $on: (event: string, callback: (event: CustomEvent) => void) => void
  setProcessing: (isProcessing: boolean) => void
  showTypingIndicator: () => void
  hideTypingIndicator: () => void
  appendMessage: (message: any) => void
  setMicRecording: (isRecording: boolean) => void
}
