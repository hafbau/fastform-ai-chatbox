import { TTSInterface, TTSState, TTSEventCallback, TTSUnsubscribe } from './TTSInterface';

export class OpenAITTSService implements TTSInterface {
  private state: TTSState = {
    isPlaying: false,
    isPaused: false,
    error: null,
    progress: 0,
    currentCharacter: 0,
    totalCharacters: 0
  };

  private audio: HTMLAudioElement | null = null;
  private eventCallback: TTSEventCallback | null = null;
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private updateState(newState: Partial<TTSState>) {
    this.state = { ...this.state, ...newState };
    if (this.eventCallback) {
      this.eventCallback(this.state);
    }
  }

  private handleError(error: { type: string; message: string }) {
    this.updateState({
      error,
      isPlaying: false,
      isPaused: false
    });
  }

  private async generateSpeech(text: string): Promise<ArrayBuffer> {
    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'tts-1',
        input: text,
        voice: 'alloy'
      })
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
      throw new Error(error.error?.message || 'Failed to generate speech');
    }

    return await response.arrayBuffer();
  }

  public async speak(text: string): Promise<void> {
    try {
      // Stop any existing audio
      this.stop();

      this.updateState({
        isPlaying: true,
        isPaused: false,
        error: null,
        progress: 0,
        currentCharacter: 0,
        totalCharacters: text.length
      });

      const audioData = await this.generateSpeech(text);
      const blob = new Blob([audioData], { type: 'audio/mpeg' });
      const url = URL.createObjectURL(blob);

      this.audio = new Audio(url);

      // Set up audio event listeners
      this.audio.addEventListener('ended', () => {
        this.updateState({
          isPlaying: false,
          isPaused: false,
          progress: 100,
          currentCharacter: text.length
        });
        URL.revokeObjectURL(url);
      });

      this.audio.addEventListener('timeupdate', () => {
        if (this.audio) {
          const progress = (this.audio.currentTime / this.audio.duration) * 100;
          const currentCharacter = Math.floor((progress / 100) * text.length);
          this.updateState({
            progress,
            currentCharacter
          });
        }
      });

      this.audio.addEventListener('error', (event) => {
        this.handleError({
          type: 'playback',
          message: `Audio playback failed: ${event.error}`
        });
        URL.revokeObjectURL(url);
      });

      // Start playing
      await this.audio.play();
    } catch (error) {
      this.handleError({
        type: 'service',
        message: error instanceof Error ? error.message : 'Failed to generate speech'
      });
    }
  }

  public stop(): void {
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
      this.audio = null;
    }

    this.updateState({
      isPlaying: false,
      isPaused: false,
      progress: 0,
      currentCharacter: 0
    });
  }

  public subscribe(callback: TTSEventCallback): TTSUnsubscribe {
    this.eventCallback = callback;
    return () => {
      this.eventCallback = null;
    };
  }

  public destroy(): void {
    this.stop();
    this.eventCallback = null;
  }
}