import { createElement } from '../utils/dom'
import { WidgetConfig } from '../types/config'

interface InputAreaEvents {
  onSubmit: (message: string) => void
  onMicClick: (event: Event) => void
}

export class InputArea {
  private element: HTMLElement
  private input: HTMLTextAreaElement
  private submitButton: HTMLButtonElement
  private micButton: HTMLButtonElement
  private config: WidgetConfig
  private events: InputAreaEvents
  private isProcessing: boolean = false

  constructor(config: WidgetConfig, events: InputAreaEvents) {
    this.config = config
    this.events = events
    this.element = this.createInputArea()
  }

  private createInputArea(): HTMLElement {
    const inputArea = createElement('div', 'buildship-chat-widget__input')
    inputArea.style.cssText = `
      border-top: 1px solid #e5e7eb;
      padding: 1rem;
      background: white;
    `
    
    // Create form wrapper
    const form = createElement('form', 'buildship-chat-widget__input-form')
    form.style.cssText = `
      display: flex;
      gap: 0.5rem;
    `
    form.addEventListener('submit', this.handleSubmit.bind(this))
    
    // Create input
    this.input = createElement('textarea', 'buildship-chat-widget__input-field') as HTMLTextAreaElement
    this.input.style.cssText = `
      flex: 1;
      min-height: 40px;
      max-height: 150px;
      padding: 8px 12px;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      resize: none;
      outline: none;
    `
    this.input.placeholder = 'Type a message...'
    this.input.rows = 1
    this.input.addEventListener('input', this.handleInput.bind(this))
    this.input.addEventListener('keydown', this.handleKeyDown.bind(this))
    form.appendChild(this.input)
    
    // Create buttons container
    const buttons = createElement('div', 'buildship-chat-widget__input-buttons')
    buttons.style.cssText = `
      display: flex;
      gap: 0.5rem;
      align-items: flex-end;
    `
    
    // Create submit button
    this.submitButton = createElement('button', 'buildship-chat-widget__submit-button') as HTMLButtonElement
    this.submitButton.type = 'submit'
    this.submitButton.style.cssText = `
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      padding: 0;
      border: none;
      background: #0066FF;
      color: white;
      border-radius: 8px;
      cursor: pointer;
    `
    this.submitButton.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M2.01 21L23 12L2.01 3L2 10L17 12L2 14L2.01 21Z" fill="currentColor"/>
      </svg>
    `
    buttons.appendChild(this.submitButton)
    
    // Create mic button if speech recognition is supported
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      this.micButton = createElement('button', 'buildship-chat-widget__mic-button') as HTMLButtonElement
      this.micButton.type = 'button'
      this.micButton.style.cssText = `
        display: flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        padding: 0;
        border: none;
        background: #f3f4f6;
        color: #374151;
        border-radius: 8px;
        cursor: pointer;
      `
      this.micButton.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 14C13.66 14 15 12.66 15 11V5C15 3.34 13.66 2 12 2C10.34 2 9 3.34 9 5V11C9 12.66 10.34 14 12 14Z" fill="currentColor"/>
          <path d="M17 11C17 14.53 14.39 17.44 11 17.93V21H13C13.55 21 14 21.45 14 22C14 22.55 13.55 23 13 23H11H7C6.45 23 6 22.55 6 22C6 21.45 6.45 21 7 21H9V17.93C5.61 17.44 3 14.53 3 11H5C5 13.76 7.24 16 10 16H14C16.76 16 19 13.76 19 11H17Z" fill="currentColor"/>
        </svg>
      `
      this.micButton.addEventListener('click', this.handleMicClick.bind(this))
      buttons.appendChild(this.micButton)
    }
    
    form.appendChild(buttons)
    inputArea.appendChild(form)
    return inputArea
  }

  private handleSubmit(event: Event): void {
    event.preventDefault()
    
    const message = this.input.value.trim()
    if (message && !this.isProcessing) {
      this.events.onSubmit(message)
      this.clear()
    }
  }

  private handleInput(): void {
    this.input.style.height = 'auto'
    this.input.style.height = `${Math.min(this.input.scrollHeight, 150)}px`
  }

  private handleKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      this.handleSubmit(event)
    }
  }

  private handleMicClick(event: Event): void {
    this.events.onMicClick(event)
  }

  public focus(): void {
    this.input.focus()
  }

  public clear(): void {
    this.input.value = ''
    this.input.style.height = 'auto'
  }

  public setProcessing(processing: boolean): void {
    this.isProcessing = processing
    this.submitButton.disabled = processing
    this.submitButton.style.opacity = processing ? '0.5' : '1'
  }

  public setMicRecording(recording: boolean): void {
    if (this.micButton) {
      this.micButton.style.background = recording ? '#ef4444' : '#f3f4f6'
      this.micButton.style.color = recording ? 'white' : '#374151'
    }
  }

  public getElement(): HTMLElement {
    return this.element
  }

  public updateConfig(config: WidgetConfig): void {
    this.config = config
  }
}
