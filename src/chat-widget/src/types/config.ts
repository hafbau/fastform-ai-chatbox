export type DisplayMode = 'fullscreen' | 'widget'
export type ButtonPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'custom'
export type WidgetPosition = 'top' | 'right' | 'bottom' | 'left' | 'custom'

export interface WidgetConfig {
  url: string
  threadId?: string | null
  user?: string | null
  title?: string
  mode?: DisplayMode
  
  // Widget mode specific options
  buttonPosition?: ButtonPosition
  widgetPosition?: WidgetPosition
  openOnLoad?: boolean
  
  // Custom positioning (when position is 'custom')
  buttonStyle?: {
    top?: string
    right?: string
    bottom?: string
    left?: string
  }
  widgetStyle?: {
    top?: string
    right?: string
    bottom?: string
    left?: string
    width?: string
    height?: string
  }

  // Common options
  responseIsAStream?: boolean
  disableErrorAlert?: boolean
  greetingMessage?: string | null
}
