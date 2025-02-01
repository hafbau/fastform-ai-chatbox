import { WidgetConfig } from '../types/config'
import { UIManager } from './uiManager'

export class MessageHandler {
  private config: WidgetConfig
  private uiManager: UIManager
  private isProcessing: boolean = false

  constructor(config: WidgetConfig, uiManager: UIManager) {
    this.config = config
    this.uiManager = uiManager
  }

  public async handleSubmit(event: Event) {
    event.preventDefault()

    if (this.isProcessing) return

    const form = event.target as HTMLFormElement
    const input = form.querySelector('input') as HTMLInputElement
    const message = input.value.trim()
    
    if (!message) return

    // Clear input and disable form
    input.value = ''
    this.isProcessing = true
    form.querySelector('button[type="submit"]')?.setAttribute('disabled', 'true')
    form.querySelector('#buildship-chat-widget__mic')?.setAttribute('disabled', 'true')

    // Add user message to chat
    this.uiManager.appendMessage({
      role: 'user',
      content: message
    })

    try {
      const response = await fetch(this.config.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          threadId: this.config.threadId,
          user: this.config.user
        }),
      })

      if (!response.ok) {
        throw new Error('Network response was not ok')
      }

      if (this.config.responseIsAStream) {
        await this.handleStreamResponse(response)
      } else {
        await this.handleRegularResponse(response)
      }
    } catch (error) {
      console.error('Error:', error)
      if (!this.config.disableErrorAlert) {
        this.uiManager.appendMessage({
          role: 'assistant',
          content: 'Sorry, there was an error processing your request. Please try again.'
        })
      }
    } finally {
      // Re-enable form
      this.isProcessing = false
      form.querySelector('button[type="submit"]')?.removeAttribute('disabled')
      form.querySelector('#buildship-chat-widget__mic')?.removeAttribute('disabled')
    }
  }

  private async handleStreamResponse(response: Response) {
    const reader = response.body?.getReader()
    if (!reader) return

    let accumulatedMessage = ''
    const decoder = new TextDecoder()

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        accumulatedMessage += chunk

        this.uiManager.appendMessage({
          role: 'assistant',
          content: accumulatedMessage
        })
      }
    } catch (error) {
      console.error('Error reading stream:', error)
      if (!this.config.disableErrorAlert) {
        this.uiManager.appendMessage({
          role: 'assistant',
          content: 'Error reading response stream. Please try again.'
        })
      }
    }
  }

  private async handleRegularResponse(response: Response) {
    const data = await response.json()
    this.uiManager.appendMessage({
      role: 'assistant',
      content: data.message || data.response || ''
    })
  }
}
