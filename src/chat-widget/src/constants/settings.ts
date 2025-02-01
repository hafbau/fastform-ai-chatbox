import { WidgetConfig } from '../types/config'

export const DEFAULT_CONFIG: Partial<WidgetConfig> = {
  title: 'Chat',
  mode: 'fullscreen',
  buttonPosition: 'bottom-right',
  widgetPosition: 'right',
  buttonFixed: true,
  widgetFixed: true,
  showBackdrop: true,
  responseIsAStream: false,
  disableErrorAlert: false,
  greetingMessage: null,
  threadId: null,
  user: null
}

export const ANIMATION_DURATION = 200 // ms
export const MAX_TEXTAREA_HEIGHT = 150 // px
export const MAX_MESSAGE_LENGTH = 1000 // characters
