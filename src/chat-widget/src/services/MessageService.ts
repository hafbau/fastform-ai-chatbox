import { WidgetConfig } from '../types/config'
import { Message, MessageRole } from '../types/messages'
import { APIService } from './APIService'
import { Widget } from '../components/Widget'

export class MessageService {
  private config: WidgetConfig
  private widget: Widget
  private apiService: APIService
  private messages: Message[] = []

  constructor(config: WidgetConfig, widget: Widget) {
    this.config = config
    this.widget = widget
    this.apiService = new APIService(config)
  }

  public async sendMessage(content: string): Promise<void> {
    // Don't send empty messages
    if (!content.trim()) return

    try {
      // Add user message
      this.addMessage('user', content)

      // Show processing state
      this.widget.setProcessing(true)
      this.widget.showTypingIndicator()

      // Send to API
      const response = await this.apiService.sendMessage(content)

      // Handle response based on config
      if (this.config.responseIsAStream) {
        let accumulatedMessage = ''
        await this.apiService.handleStreamResponse(response, (chunk) => {
          accumulatedMessage += chunk
          this.updateLastMessage(accumulatedMessage)
        })
      } else {
        const content = await this.apiService.handleRegularResponse(response)
        this.addMessage('assistant', content)
      }
    } catch (error) {
      console.error('Error sending message:', error)
      if (!this.config.disableErrorAlert) {
        this.addMessage('assistant', 'Sorry, there was an error processing your request. Please try again.')
      }
    } finally {
      this.widget.hideTypingIndicator()
      this.widget.setProcessing(false)
    }
  }

  private addMessage(role: MessageRole, content: string): void {
    const message: Message = {
      role,
      content,
      timestamp: Date.now(),
      id: Math.random().toString(36).substr(2, 9)
    }
    
    this.messages.push(message)
    this.widget.appendMessage(message)
  }

  private updateLastMessage(content: string): void {
    const lastMessage = this.messages[this.messages.length - 1]
    if (lastMessage && lastMessage.role === 'assistant') {
      lastMessage.content = content
      // Re-render the message
      this.widget.appendMessage(lastMessage)
    } else {
      this.addMessage('assistant', content)
    }
  }

  public getMessages(): Message[] {
    return [...this.messages]
  }

  public clearMessages(): void {
    this.messages = []
    this.widget.clear()
  }
}
