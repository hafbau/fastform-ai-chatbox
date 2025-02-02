import type { WidgetConfig } from '../types/config'
import type { Message } from '../types/messages'
import { MessageRoles } from '../types/messages'
import { APIService } from './APIService'

interface MessageServiceCallbacks {
  config: WidgetConfig
  onSubmit: ((message: string) => void) | null
  onClose: (() => void) | null
  appendMessage: (message: Message) => void
  setProcessing: (isProcessing: boolean) => void
  showTypingIndicator: () => void
  hideTypingIndicator: () => void
}

export class MessageService {
  private config: WidgetConfig
  private apiService: APIService
  private callbacks: MessageServiceCallbacks

  constructor(callbacks: MessageServiceCallbacks) {
    this.callbacks = callbacks
    this.config = callbacks.config
    this.apiService = new APIService(callbacks.config)
  }

  public async handleSubmit(message: string): Promise<void> {
    if (this.callbacks.onSubmit) {
      this.callbacks.onSubmit(message)
    }

    if (this.config.url) {
      try {
        this.callbacks.setProcessing(true)
        this.callbacks.showTypingIndicator()

        const response = await this.apiService.sendMessage(message)
        
        if (response.ok) {
          const data = await response.json()
          this.callbacks.appendMessage({
            role: MessageRoles.ASSISTANT,
            content: data.message,
            timestamp: Date.now(),
            id: Math.random().toString(36).substr(2, 9)
          })
        } else {
          console.error('Failed to send message:', response.statusText)
          if (!this.config.disableErrorAlert) {
            this.callbacks.appendMessage({
              role: MessageRoles.SYSTEM,
              content: 'Failed to send message. Please try again.',
              timestamp: Date.now(),
              id: Math.random().toString(36).substr(2, 9)
            })
          }
        }
      } catch (error) {
        console.error('Error sending message:', error)
        if (!this.config.disableErrorAlert) {
          this.callbacks.appendMessage({
            role: MessageRoles.SYSTEM,
            content: 'An error occurred. Please try again.',
            timestamp: Date.now(),
            id: Math.random().toString(36).substr(2, 9)
          })
        }
      } finally {
        this.callbacks.hideTypingIndicator()
        this.callbacks.setProcessing(false)
      }
    }
  }

  public handleClose(): void {
    if (this.callbacks.onClose) {
      this.callbacks.onClose()
    }
  }
}
