import type { SpeechConfig, SpeechResult } from '../types/speech'

const DEFAULT_CONFIG: Required<SpeechConfig> = {
  language: 'en-US',
  continuous: true,
  interimResults: true,
  maxAlternatives: 1
}

export class SpeechToTextService {
  private recognition: any = null
  private config: Required<SpeechConfig>
  private onResult: ((result: SpeechResult) => void) | null = null

  constructor(config: Partial<SpeechConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
    this.initializeSpeechRecognition()
  }

  private initializeSpeechRecognition() {
    if (!('webkitSpeechRecognition' in window)) {
      throw new Error('Speech recognition is not supported in this browser.')
    }

    try {
      this.recognition = new (window as any).webkitSpeechRecognition()
      this.recognition.continuous = this.config.continuous
      this.recognition.interimResults = this.config.interimResults
      this.recognition.maxAlternatives = this.config.maxAlternatives
      this.recognition.lang = this.config.language

      this.setupEventListeners()
    } catch (error) {
      console.error('Failed to initialize speech recognition:', error)
      throw error
    }
  }

  private setupEventListeners() {
    if (!this.recognition) return

    this.recognition.onresult = (event: any) => {
      const result = event.results[event.results.length - 1]
      const transcript = result[0].transcript
      
      if (this.onResult) {
        this.onResult({
          transcript,
          confidence: result[0].confidence,
          isFinal: result.isFinal
        })
      }
    }

    this.recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error)
      this.stop()
    }

    this.recognition.onend = () => {
      if (this.onResult) {
        this.onResult({
          transcript: '',
          confidence: 0,
          isFinal: true
        })
      }
    }
  }

  public start(onResult: (result: SpeechResult) => void) {
    if (!this.recognition) {
      throw new Error('Speech recognition not initialized')
    }

    this.onResult = onResult
    this.recognition.start()
  }

  public stop() {
    if (this.recognition) {
      try {
        this.recognition.stop()
      } catch (error) {
        console.error('Error stopping speech recognition:', error)
      }
    }
  }
}
