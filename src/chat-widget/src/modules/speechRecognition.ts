import { WidgetConfig } from '../types/config'

type SpeechRecognitionEvent = {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string
        confidence: number
        isFinal?: boolean
      }
    }
    length: number
  }
}

type SpeechRecognitionErrorEvent = {
  error: string
  message?: string
}

interface SpeechRecognitionInstance {
  continuous: boolean
  interimResults: boolean
  lang?: string
  start(): void
  stop(): void
  addEventListener(type: string, callback: (event: any) => void): void
  removeEventListener(type: string, callback: (event: any) => void): void
}

declare global {
  interface Window {
    SpeechRecognition?: {
      new(): SpeechRecognitionInstance
    }
    webkitSpeechRecognition?: {
      new(): SpeechRecognitionInstance
    }
  }
}

export class SpeechRecognitionManager {
  private config: WidgetConfig
  private recognition: SpeechRecognitionInstance | null = null
  private isRecording: boolean = false
  private noSpeechTimeout: number | null = null
  private recordingStartTime: number | null = null

  constructor(config: WidgetConfig) {
    this.config = config
    
    // Initialize speech recognition
    const SpeechRecognitionConstructor = window.SpeechRecognition || window.webkitSpeechRecognition
    if (SpeechRecognitionConstructor) {
      this.recognition = new SpeechRecognitionConstructor()
      this.recognition.continuous = false
      this.recognition.interimResults = true

      this.setupRecognitionHandlers()
    }
  }

  private setupRecognitionHandlers() {
    if (!this.recognition) return

    this.recognition.addEventListener('start', () => {
      this.isRecording = true
      this.recordingStartTime = Date.now()
      this.startNoSpeechTimeout()
    })

    this.recognition.addEventListener('end', () => {
      this.isRecording = false
      this.recordingStartTime = null
      if (this.noSpeechTimeout) {
        clearTimeout(this.noSpeechTimeout)
        this.noSpeechTimeout = null
      }
    })

    this.recognition.addEventListener('error', (event: SpeechRecognitionErrorEvent) => {
      if (event.error === 'no-speech') {
        this.showTooltip('No speech detected')
      } else if (event.error === 'not-allowed') {
        this.showTooltip('Microphone access denied')
      }
      this.stopRecording()
    })

    this.recognition.addEventListener('result', (event: SpeechRecognitionEvent) => {
      const transcript = Array.from({ length: event.results.length })
        .map((_, i) => event.results[i][0].transcript)
        .join('')

      const input = document.querySelector('#buildship-chat-widget__input') as HTMLInputElement
      if (input) {
        input.value = transcript

        // Auto-send if enabled and we have a final result
        if (this.config.autoSendAudioMessage && event.results[0][0].isFinal) {
          const form = input.closest('form')
          if (form) {
            this.stopRecording()
            form.dispatchEvent(new Event('submit'))
          }
        }
      }
    })
  }

  public toggleRecording(event: Event, containerElement: HTMLElement) {
    event.preventDefault()
    event.stopPropagation()

    if (!this.recognition) {
      this.showTooltip('Speech recognition not supported')
      return
    }

    if (this.isRecording) {
      this.stopRecording()
    } else {
      this.startRecording()
    }

    const micButton = containerElement.querySelector('#buildship-chat-widget__mic')
    if (micButton) {
      micButton.classList.toggle('recording', this.isRecording)
    }
  }

  private startRecording() {
    try {
      this.recognition?.start()
    } catch (error) {
      console.error('Error starting recording:', error)
    }
  }

  private stopRecording() {
    try {
      this.recognition?.stop()
    } catch (error) {
      console.error('Error stopping recording:', error)
    }
  }

  private startNoSpeechTimeout() {
    if (this.noSpeechTimeout) {
      clearTimeout(this.noSpeechTimeout)
    }

    this.noSpeechTimeout = window.setTimeout(() => {
      if (this.isRecording && this.recordingStartTime && Date.now() - this.recordingStartTime > 2000) {
        this.showTooltip('No speech detected')
        this.stopRecording()
      }
    }, 2000)
  }

  private showTooltip(message: string) {
    const tooltip = document.createElement('div')
    tooltip.className = 'buildship-chat-widget__tooltip'
    tooltip.textContent = message
    
    const micButton = document.querySelector('#buildship-chat-widget__mic')
    if (micButton) {
      micButton.appendChild(tooltip)
      setTimeout(() => tooltip.remove(), 3000)
    }
  }
}
