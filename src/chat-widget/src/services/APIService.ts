import { WidgetConfig } from '../types/config'
import { Message, MessageResponse } from '../types/messages'

export class APIService {
  private config: WidgetConfig

  constructor(config: WidgetConfig) {
    this.config = config
  }

  public async sendMessage(message: string): Promise<Response> {
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

    return response
  }

  public async handleStreamResponse(response: Response, onChunk: (chunk: string) => void): Promise<void> {
    const reader = response.body?.getReader()
    if (!reader) return

    const decoder = new TextDecoder()

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        onChunk(chunk)
      }
    } catch (error) {
      console.error('Error reading stream:', error)
      throw error
    }
  }

  public async handleRegularResponse(response: Response): Promise<string> {
    const data: MessageResponse = await response.json()
    return data.message || data.response || 'No response content'
  }
}
