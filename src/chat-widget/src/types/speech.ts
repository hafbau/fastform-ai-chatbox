export interface SpeechRecognitionEvent extends Event {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string
        confidence: number
      }
    }
    length: number
  }
}

export interface SpeechRecognitionErrorEvent extends Event {
  error: string
}

export interface SpeechRecognition extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  start(): void
  stop(): void
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null
  onend: (() => void) | null
}

declare global {
  interface Window {
    SpeechRecognition: {
      new(): SpeechRecognition
    }
    webkitSpeechRecognition: {
      new(): SpeechRecognition
    }
  }
}
