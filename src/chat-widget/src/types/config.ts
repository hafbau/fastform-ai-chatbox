export type WidgetConfig = {
  url: string
  threadId: string | null
  user: Record<string, any> | null
  responseIsAStream: boolean
  widgetTitle: string
  greetingMessage: string | null
  disableErrorAlert: boolean
  closeOnOutsideClick: boolean
  openOnLoad: boolean
  showAs: 'modal' | 'popover' | 'inline'
  enableAudioInput: boolean
  autoSendAudioMessage: boolean
}
