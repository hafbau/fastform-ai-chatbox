import { createElement } from '../utils/dom'
import { WidgetConfig } from '../types/config'
import { Header } from './Header'
import { MessageList } from './MessageList'
import { InputArea } from './InputArea'
import { Message } from '../types/messages'

export interface WidgetEvents {
  onSubmit: (message: string) => void
  onClose: () => void
  onMicClick: (event: Event) => void
}

export class Widget {
  private config: WidgetConfig
  private events: WidgetEvents
  private element: HTMLElement
  private header: Header
  private messageList: MessageList
  private inputArea: InputArea
  private container: HTMLElement | null = null

  constructor(config: WidgetConfig, events: WidgetEvents) {
    this.config = config
    this.events = events
    this.element = this.createWidget()
    
    // Initialize components
    this.header = new Header(config, events.onClose)
    this.messageList = new MessageList()
    this.inputArea = new InputArea(config, {
      onSubmit: events.onSubmit,
      onMicClick: events.onMicClick
    })

    // Get container
    const container = this.element.querySelector('.buildship-chat-widget__container') as HTMLElement
    if (container) {
      container.appendChild(this.header.getElement())
      container.appendChild(this.messageList.getElement())
      container.appendChild(this.inputArea.getElement())
    }
  }

  private createWidget(): HTMLElement {
    const widget = createElement('div', 'buildship-chat-widget buildship-chat-widget--hidden')
    
    // Add mode-specific class
    const mode = this.config.mode || 'fullscreen'
    widget.classList.add(`buildship-chat-widget--${mode}`)

    // Create container with flex layout
    const container = createElement('div', 'buildship-chat-widget__container')
    container.style.cssText = `
      height: 100%;
      display: flex;
      flex-direction: column;
    `
    
    widget.appendChild(container)
    return widget
  }

  public appendMessage(message: Message): void {
    this.messageList.appendMessage(message)
  }

  public show(): void {
    this.element.classList.remove('buildship-chat-widget--hidden')
    this.inputArea.focus()
  }

  public hide(): void {
    this.element.classList.add('buildship-chat-widget--hidden')
  }

  public showTypingIndicator(): void {
    this.messageList.showTypingIndicator()
  }

  public hideTypingIndicator(): void {
    this.messageList.hideTypingIndicator()
  }

  public setProcessing(processing: boolean): void {
    this.inputArea.setProcessing(processing)
  }

  public setMicRecording(recording: boolean): void {
    this.inputArea.setMicRecording(recording)
  }

  public clear(): void {
    this.messageList.clear()
    this.inputArea.clear()
  }

  public mount(container: HTMLElement): void {
    this.container = container
    container.appendChild(this.element)
  }

  public destroy(): void {
    if (this.element.parentElement) {
      this.element.parentElement.removeChild(this.element)
    }
  }

  public getElement(): HTMLElement {
    return this.element
  }

  public updateConfig(config: Partial<WidgetConfig>): void {
    this.config = { ...this.config, ...config }
    
    // Update mode class
    const mode = this.config.mode || 'fullscreen'
    this.element.className = `buildship-chat-widget buildship-chat-widget--${mode}`
    
    // Update components with new config
    this.header.updateConfig(this.config)
    this.inputArea.updateConfig(this.config)
  }
}
