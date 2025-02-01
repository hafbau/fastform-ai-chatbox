import { createElement } from '../utils/dom'
import { WidgetConfig } from '../types/config'

export class Header {
  private element: HTMLElement
  private config: WidgetConfig
  private onClose: () => void

  constructor(config: WidgetConfig, onClose: () => void) {
    this.config = config
    this.onClose = onClose
    this.element = this.createHeader()
  }

  private createHeader(): HTMLElement {
    const header = createElement('div', 'buildship-chat-widget__header')
    
    // Create title
    const title = createElement('div', 'buildship-chat-widget__title')
    title.textContent = this.config.title || 'Chat'
    header.appendChild(title)
    
    // Create close button for widget mode
    if (this.config.mode === 'widget') {
      const closeButton = createElement('button', 'buildship-chat-widget__close')
      closeButton.setAttribute('aria-label', 'Close chat')
      closeButton.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      `
      closeButton.addEventListener('click', () => this.onClose())
      header.appendChild(closeButton)
    }
    
    return header
  }

  public getElement(): HTMLElement {
    return this.element
  }

  public updateConfig(config: WidgetConfig): void {
    this.config = config
    const title = this.element.querySelector('.buildship-chat-widget__title')
    if (title) {
      title.textContent = config.title || 'Chat'
    }
  }
}
