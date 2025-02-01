import { WidgetConfig } from './types/config'
import { Widget } from './components/Widget'
import { MessageService } from './services/MessageService'
import { SpeechService } from './services/SpeechService'
import { DEFAULT_CONFIG } from './constants/settings'

// Import styles
import './ui/styles/base.css'
import './ui/styles/messages.css'
import './ui/styles/input.css'

export class ChatWidget {
  private config: WidgetConfig
  private widget: Widget
  private messageService: MessageService
  private speechService: SpeechService
  private isInitialized: boolean = false

  constructor(config: Partial<WidgetConfig>) {
    console.log('ChatWidget constructor:', config)
    // Merge provided config with defaults
    this.config = { ...DEFAULT_CONFIG, ...config } as WidgetConfig

    // Initialize widget with event handlers
    this.widget = new Widget(this.config, {
      onSubmit: (message) => this.handleSubmit(message),
      onClose: () => this.hide(),
      onMicClick: (event) => this.handleMicClick(event)
    })

    // Initialize services
    this.messageService = new MessageService(this.config, this.widget)
    this.speechService = new SpeechService(this.widget, (text) => this.handleSpeechResult(text))
  }

  private handleSubmit(message: string): void {
    console.log('Submitting message:', message)
    this.messageService.sendMessage(message)
  }

  private handleMicClick(event: Event): void {
    console.log('Mic clicked:', event)
    event.preventDefault()
    if (this.speechService.isSupported()) {
      this.speechService.toggleRecording()
    } else {
      console.warn('Speech recognition is not supported in this browser')
    }
  }

  private handleSpeechResult(text: string): void {
    console.log('Speech result:', text)
    if (text.trim()) {
      this.messageService.sendMessage(text)
    }
  }

  public mount(container?: HTMLElement): void {
    console.log('ChatWidget mount:', container)
    if (this.isInitialized) {
      console.warn('Chat widget is already initialized')
      return
    }

    const targetContainer = container || document.body
    targetContainer.appendChild(this.widget.getElement())
    this.isInitialized = true
  }

  public show(): void {
    console.log('ChatWidget show')
    if (!this.isInitialized) {
      console.warn('Chat widget is not initialized. Call mount() first.')
      return
    }
    this.widget.show()
  }

  public hide(): void {
    console.log('ChatWidget hide')
    this.widget.hide()
  }

  public clear(): void {
    console.log('ChatWidget clear')
    this.messageService.clearMessages()
  }

  public destroy(): void {
    console.log('ChatWidget destroy')
    if (!this.isInitialized) return

    const element = this.widget.getElement()
    element.parentElement?.removeChild(element)
    this.isInitialized = false
  }
}

// Export as global variable for non-module environments
declare global {
  interface Window {
    ChatWidget: typeof ChatWidget
  }
}

window.ChatWidget = ChatWidget
