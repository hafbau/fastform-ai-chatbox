import { WidgetConfig } from '../types/config'
import { widgetHTML } from '../widgetHtmlString'
import { marked } from 'marked'

// Configure marked for security
marked.setOptions({
  breaks: true,
  gfm: true
})

export class UIManager {
  private config: WidgetConfig
  private widget: HTMLElement | null = null
  private messagesContainer: HTMLElement | null = null
  private typingIndicator: HTMLElement | null = null
  private isOpen: boolean = false

  constructor(config: WidgetConfig) {
    this.config = config
    this.initializeWidget()
  }

  private initializeWidget() {
    // Create widget element
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = widgetHTML
    this.widget = tempDiv.firstElementChild as HTMLElement

    // Set display mode
    if (this.widget) {
      this.widget.setAttribute('data-mode', this.config.showAs || 'modal')
    }

    // Get important elements
    this.messagesContainer = this.widget.querySelector('.buildship-chat-widget__messages-container')
    this.typingIndicator = this.widget.querySelector('.buildship-chat-widget__typing')

    // Add event listeners
    this.setupEventListeners()

    // Add widget to DOM
    document.body.appendChild(this.widget)
  }

  private setupEventListeners() {
    if (!this.widget) return

    // Close button
    const closeButton = this.widget.querySelector('.buildship-chat-widget__close')
    if (closeButton) {
      closeButton.addEventListener('click', (e) => {
        e.preventDefault()
        e.stopPropagation()
        this.close()
      })
    }

    // Auto-growing textarea
    const textarea = this.widget.querySelector('#buildship-chat-widget__input') as HTMLTextAreaElement
    if (textarea) {
      textarea.addEventListener('input', () => {
        this.adjustTextareaHeight(textarea)
      })

      // Handle submit button state
      const submitButton = this.widget.querySelector('.buildship-chat-widget__submit') as HTMLButtonElement
      if (submitButton) {
        textarea.addEventListener('input', () => {
          submitButton.disabled = !textarea.value.trim()
        })
      }

      // Handle Enter key
      textarea.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault()
          const form = textarea.closest('form')
          if (form && textarea.value.trim()) {
            form.dispatchEvent(new Event('submit'))
          }
        }
      })
    }

    // Click outside to close
    if (this.config.closeOnOutsideClick) {
      document.addEventListener('click', (e) => {
        if (!this.isOpen) return
        
        const target = e.target as HTMLElement
        if (!this.widget?.contains(target)) {
          this.close()
        }
      })

      // Prevent clicks inside widget from closing it
      this.widget.addEventListener('click', (e) => {
        e.stopPropagation()
      })
    }
  }

  private adjustTextareaHeight(textarea: HTMLTextAreaElement) {
    textarea.style.height = 'auto'
    textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`
  }

  public open(event: { target: HTMLElement }) {
    if (!this.widget || this.isOpen) return

    // Position widget if in popover mode
    if (this.config.showAs === 'popover') {
      const targetRect = event.target.getBoundingClientRect()
      const viewportHeight = window.innerHeight
      const viewportWidth = window.innerWidth

      // On mobile, always show full screen
      if (viewportWidth < 640) {
        this.widget.style.removeProperty('transform')
        this.widget.style.removeProperty('top')
        this.widget.style.removeProperty('left')
        this.widget.style.removeProperty('right')
        this.widget.style.removeProperty('bottom')
      } else {
        // Calculate position
        const spaceBelow = viewportHeight - targetRect.bottom
        const spaceRight = viewportWidth - targetRect.right
        
        // Position vertically
        if (spaceBelow < 400 && targetRect.top > 400) {
          // Position above target
          this.widget.style.top = 'auto'
          this.widget.style.bottom = `${viewportHeight - targetRect.top + 10}px`
        } else {
          // Position below target
          this.widget.style.top = `${targetRect.bottom + 10}px`
          this.widget.style.bottom = 'auto'
        }

        // Position horizontally
        if (spaceRight < 400 && targetRect.left > 400) {
          // Position to the left
          this.widget.style.right = 'auto'
          this.widget.style.left = `${targetRect.left}px`
        } else {
          // Position to the right
          this.widget.style.right = `${viewportWidth - targetRect.right}px`
          this.widget.style.left = 'auto'
        }
      }
    }

    // Show widget
    this.widget.classList.remove('buildship-chat-widget--hidden')
    this.isOpen = true

    // Focus input
    const input = this.widget.querySelector('#buildship-chat-widget__input') as HTMLInputElement
    if (input) {
      setTimeout(() => input.focus(), 100)
    }

    // Scroll messages to bottom
    this.scrollToBottom()
  }

  public close() {
    if (!this.widget || !this.isOpen) return

    this.widget.classList.add('buildship-chat-widget--hidden')
    this.isOpen = false
  }

  public appendMessage({ role, content }: { role: 'user' | 'assistant', content: string }) {
    if (!this.messagesContainer) return

    // Remove typing indicator if present
    this.hideTypingIndicator()

    // Create message element
    const messageDiv = document.createElement('div')
    messageDiv.className = `buildship-chat-widget__message buildship-chat-widget__message--${role}`
    
    // Parse markdown for assistant messages only
    if (role === 'assistant') {
      const parsedContent = marked.parse(content)
      if (typeof parsedContent === 'string') {
        messageDiv.innerHTML = parsedContent
      } else {
        messageDiv.textContent = content
      }
    } else {
      messageDiv.textContent = content
    }

    // Add message to container
    this.messagesContainer.appendChild(messageDiv)

    // Scroll to bottom
    this.scrollToBottom()
  }

  public showTypingIndicator() {
    if (this.typingIndicator) {
      this.typingIndicator.style.display = 'flex'
      this.scrollToBottom()
    }
  }

  public hideTypingIndicator() {
    if (this.typingIndicator) {
      this.typingIndicator.style.display = 'none'
    }
  }

  private scrollToBottom() {
    const messages = this.widget?.querySelector('.buildship-chat-widget__messages')
    if (messages) {
      messages.scrollTop = messages.scrollHeight
    }
  }
}
