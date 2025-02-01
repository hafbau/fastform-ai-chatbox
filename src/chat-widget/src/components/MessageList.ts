import { createElement } from '../utils/dom'
import { Message } from '../types/messages'
import { parseMarkdown, sanitizeHTML } from '../utils/markdown'

export class MessageList {
  private element: HTMLElement
  private messages: HTMLElement
  private typingIndicator: HTMLElement

  constructor() {
    // Create main element with flex and scroll
    this.element = createElement('div', 'buildship-chat-widget__messages')
    this.element.style.cssText = `
      flex: 1;
      min-height: 0;
      overflow-y: auto;
      padding: 1rem;
    `
    
    // Create messages container
    this.messages = createElement('div', 'buildship-chat-widget__messages-container')
    this.element.appendChild(this.messages)

    // Create typing indicator
    this.typingIndicator = createElement('div', 'buildship-chat-widget__typing-indicator')
    this.typingIndicator.style.display = 'none'
    this.typingIndicator.innerHTML = `
      <div class="buildship-chat-widget__typing-bubble"></div>
      <div class="buildship-chat-widget__typing-bubble"></div>
      <div class="buildship-chat-widget__typing-bubble"></div>
    `
    this.element.appendChild(this.typingIndicator)
  }

  public appendMessage(message: Message): void {
    // Remove typing indicator if present
    this.hideTypingIndicator()

    const messageEl = createElement('div', 'buildship-chat-widget__message')
    messageEl.classList.add(`buildship-chat-widget__message--${message.role}`)
    
    const content = createElement('div', 'buildship-chat-widget__message-content')
    // Parse markdown for assistant messages only
    if (message.role === 'assistant') {
      const parsedContent = parseMarkdown(message.content)
      content.innerHTML = sanitizeHTML(parsedContent)
    } else {
      content.textContent = message.content
    }
    messageEl.appendChild(content)
    
    this.messages.appendChild(messageEl)
    this.scrollToBottom()
  }

  private scrollToBottom(): void {
    this.element.scrollTop = this.element.scrollHeight
  }

  public showTypingIndicator(): void {
    this.typingIndicator.style.display = 'flex'
    this.scrollToBottom()
  }

  public hideTypingIndicator(): void {
    this.typingIndicator.style.display = 'none'
  }

  public clear(): void {
    this.messages.innerHTML = ''
    this.hideTypingIndicator()
  }

  public getElement(): HTMLElement {
    return this.element
  }
}
