export interface TTSState {
  isPlaying: boolean;
  isPaused: boolean;
  error: null | {
    type: string;
    message: string;
  };
  progress: number;
  currentCharacter: number;
  totalCharacters: number;
}

export type TTSEventCallback = (state: TTSState) => void;
export type TTSUnsubscribe = () => void;

export interface TTSInterface {
  /**
   * Speaks the provided text using speech synthesis
   * @param text The text to be spoken
   */
  speak(text: string): Promise<void>;

  /**
   * Stops the current speech synthesis
   */
  stop(): void;

  /**
   * Subscribes to TTS state changes
   * @param callback Function to be called when state changes
   * @returns Unsubscribe function
   */
  subscribe(callback: TTSEventCallback): TTSUnsubscribe;

  /**
   * Cleans up resources and stops any ongoing speech synthesis
   */
  destroy(): void;
}