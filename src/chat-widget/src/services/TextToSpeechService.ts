export class TextToSpeechService {
  private state: any = {
    isPlaying: false,
    isPaused: false,
    error: null,
    progress: 0,
    currentCharacter: 0,
    totalCharacters: 0
  }
  private eventCallback: any | null = null
  private voice: SpeechSynthesisVoice | null = null
  private language: string = 'en-US'
  private voicesLoaded = false

  constructor() {
    this.initializeVoice()
  }

  private initializeVoice() {
    const voices = window.speechSynthesis.getVoices()
    if (voices.length === 0) {
      window.speechSynthesis.addEventListener('voiceschanged', () => {
        const voices = window.speechSynthesis.getVoices()
        this.voice = voices.find(voice => voice.lang === this.language && voice.default) || voices[0]
        this.voicesLoaded = true
      })
    } else {
      this.voice = voices.find(voice => voice.lang === this.language && voice.default) || voices[0]
      this.voicesLoaded = true
    }
  }

  private updateState(newState: any) {
    this.state = { ...this.state, ...newState }
    if (this.eventCallback) {
      this.eventCallback(this.state)
    }
  }

  private handleError(error: any) {
    this.updateState({
      error,
      isPlaying: false,
      isPaused: false
    })
  }

  public async speak(text: string) {
    // Wait for voices to be loaded
    if (!this.voicesLoaded) {
      await new Promise<void>(resolve => {
        const checkVoices = () => {
          if (this.voicesLoaded) {
            resolve()
          } else {
            setTimeout(checkVoices, 100)
          }
        }
        checkVoices()
      })
    }

    window.speechSynthesis.cancel()
    
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.voice = this.voice
    utterance.lang = this.language

    this.updateState({
      isPlaying: true,
      isPaused: false,
      error: null,
      progress: 0,
      currentCharacter: 0,
      totalCharacters: text.length
    })

    // Setup event handlers
    utterance.onstart = () => {
      this.updateState({ isPlaying: true })
    }

    utterance.onend = () => {
      this.updateState({
        isPlaying: false,
        isPaused: false,
        progress: 100,
        currentCharacter: text.length
      })
    }

    utterance.onerror = (event: any) => {
      this.handleError({
        type: 'service',
        message: `Speech synthesis failed: ${event.error}`
      })
    }

    utterance.onpause = () => {
      this.updateState({ isPaused: true })
    }

    utterance.onresume = () => {
      this.updateState({ isPaused: false })
    }

    utterance.onboundary = (event: any) => {
      this.updateState({
        currentCharacter: event.charIndex,
        progress: (event.charIndex / text.length) * 100
      })
    }

    try {
      window.speechSynthesis.speak(utterance)
    } catch (error) {
      this.handleError({
        type: 'service',
        message: 'Failed to start speech synthesis.'
      })
    }
  }

  public stop() {
    window.speechSynthesis.cancel()
    this.updateState({
      isPlaying: false,
      isPaused: false,
      progress: 0,
      currentCharacter: 0
    })
  }

  public subscribe(callback: any) {
    this.eventCallback = callback
    return () => {
      this.eventCallback = null
    }
  }

  public destroy() {
    this.stop()
    this.eventCallback = null
  }
}
