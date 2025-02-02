import type { SpeechConfig, SpeechResult } from '../types/speech'

const DEFAULT_CONFIG: Required<SpeechConfig> = {
  language: 'en-US',
  continuous: true,
  interimResults: true,
  maxAlternatives: 1
}

export class SpeechToTextService {
  private recognition: SpeechRecognition | null = null
  private config: Required<SpeechConfig>
  private onResult: ((result: SpeechResult) => void) | null = null

  constructor(config: Partial<SpeechConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
    this.initializeSpeechRecognition()
  }

  private initializeSpeechRecognition() {
    if (!('webkitSpeechRecognition' in window)) {
      console.error('Speech recognition is not supported in this browser.')
      return
    }

    try {
      this.recognition = new (window as any).webkitSpeechRecognition()
      if (this.recognition) {
        this.recognition.continuous = this.config.continuous
        this.recognition.interimResults = this.config.interimResults
        this.recognition.maxAlternatives = this.config.maxAlternatives
        this.recognition.lang = this.config.language
        this.setupEventListeners()
      }
    } catch (error) {
      console.error('Failed to initialize speech recognition:', error)
    }
  }

  private setupEventListeners() {
    if (!this.recognition) return

    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const result = event.results[i]
        const transcript = result[0].transcript
        if (this.onResult) {
          this.onResult({
            transcript,
            confidence: result[0].confidence,
            isFinal: result.isFinal
          })
        }
      }
    }

    this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error)
    }
  }

  public start(onResult: (result: SpeechResult) => void) {
    this.onResult = onResult
    this.recognition?.start()
  }

  public stop() {
    this.recognition?.stop()
  }
}
