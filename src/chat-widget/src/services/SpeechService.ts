import type { WidgetConfig } from '../types/config'

// Define WebkitSpeechRecognition types
interface SpeechRecognitionResult {
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface IWebkitSpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onstart: (event: Event) => void;
  onend: (event: Event) => void;
  onerror: (event: Event) => void;
  onresult: (event: SpeechRecognitionEvent) => void;
}

declare global {
  interface Window {
    webkitSpeechRecognition: new () => IWebkitSpeechRecognition;
  }
}

interface SpeechServiceCallbacks {
  config: WidgetConfig
  onMicClick: ((event: Event) => void) | null
  onResult: (text: string) => void
  setRecording: (isRecording: boolean) => void
}

export class SpeechService {
  private config: WidgetConfig
  private recognition: any
  private isRecording: boolean = false
  private callbacks: SpeechServiceCallbacks

  constructor(callbacks: SpeechServiceCallbacks) {
    this.callbacks = callbacks
    this.config = callbacks.config
    this.initSpeechRecognition()
  }

  private initSpeechRecognition(): void {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const WebkitSpeechRecognition = (window as any).webkitSpeechRecognition
      this.recognition = new WebkitSpeechRecognition()
      this.recognition.continuous = false
      this.recognition.interimResults = true

      this.recognition.onstart = () => {
        this.isRecording = true
        this.callbacks.setRecording(true)
      };

      this.recognition.onend = () => {
        this.isRecording = false
        this.callbacks.setRecording(false)
      };

      this.recognition.onresult = (event: SpeechRecognitionEvent) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const result = event.results[i];
          const transcript = result[0].transcript;
          
          if (result.isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        if (finalTranscript) {
          this.callbacks.onResult(finalTranscript);
        }
      };

      this.recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error)
        this.stopRecording()
      };
    }
  }

  public isSupported(): boolean {
    return typeof window !== 'undefined' && 'webkitSpeechRecognition' in window
  }

  public startRecording(): void {
    if (!this.isRecording && this.recognition) {
      this.isRecording = true
      this.callbacks.setRecording(true)
      this.recognition.start()
    }
  }

  public stopRecording(): void {
    if (this.isRecording && this.recognition) {
      this.isRecording = false
      this.callbacks.setRecording(false)
      this.recognition.stop()
    }
  }

  public toggleRecording(): void {
    if (!this.recognition) {
      console.warn('Speech recognition is not supported in this browser')
      return
    }

    if (this.isRecording) {
      this.recognition.stop()
    } else {
      this.recognition.start()
    }
  }

  public cleanup(): void {
    this.stopRecording()
    if (this.recognition) {
      this.recognition.onresult = null
      this.recognition.onerror = null
      this.recognition.onend = null
    }
  }
}
