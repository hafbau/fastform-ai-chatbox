<script>
  import { fade, scale } from "svelte/transition";
  import { createEventDispatcher, onMount, onDestroy } from "svelte";
  import SpeechRecorder from "./SpeechRecorder.svelte";
  import { TextToSpeechService } from "../services/TextToSpeechService";

  export let visible = false;
  export let language = 'en-US';
  export let isProcessing = false;
  export let aiResponse = ''; 
  
  let status = "ready";
  let transcript = "";
  let speechService;
  let playbackProgress = 0;
  let lastAiResponse = ''; // Track last response to avoid duplicate playback
  const dispatch = createEventDispatcher();

  onMount(() => {
    speechService = new TextToSpeechService();
    speechService.subscribe(handleSpeechState);

    if (isProcessing) {
      status = 'processing-ai';
    }
  });

  onDestroy(() => {
    if (speechService) {
      speechService.stop();
    }
  });

  function handleSpeechState(state) {
    if (state.error) {
      dispatch('error', state.error);
      status = 'ready';
    } else {
      playbackProgress = state.progress;
      if (!state.isPlaying && status === 'speaking' && !state.isPaused) {
        status = 'ready';
        dispatch('speakingComplete');
      }
    }
  }

  function updateRecordingStatus(isRecording) {
    if (isRecording) {
      // If AI is speaking, stop it gracefully
      if (status === 'speaking') {
        speechService.stop();
        dispatch('interrupted');
      }
      status = 'recording';
    } else {
      status = 'processing-speech';
      if (transcript) {
        setTimeout(() => {
          status = 'processing-ai';
        }, 1000);
      }
    }
  }

  function handleClose() {
    if (status === 'speaking' && speechService) {
      speechService.stop();
    }
    dispatch("close");
  }

  function handleSpeechResult(event) {
    const { transcript: text, isFinal } = event.detail;
    transcript = text;
    if (isFinal) {
      dispatch('submit', text);
    }
  }

  function handleSpeechError(event) {
    dispatch('error', event.detail);
  }

  // Handle AI response playback
  $: if (aiResponse && status === 'processing-ai' && aiResponse !== lastAiResponse) {
    lastAiResponse = aiResponse;
    status = 'speaking';
    speechService.speak(aiResponse).catch(error => {
      dispatch('error', error);
      status = 'ready';
    });
  }

  function getStatusContent() {
    switch (status) {
      case 'ready':
        return {
          title: 'Ready to Listen',
          message: 'Click the microphone to start speaking',
          icon: 'mic'
        };
      case 'recording':
        return {
          title: 'Listening...',
          message: transcript || 'Speak your message and it will be sent automatically',
          icon: 'mic'
        };
      case 'processing-speech':
        return {
          title: 'Processing Speech',
          message: 'Converting your speech to text...',
          icon: 'processing'
        };
      case 'processing-ai':
        return {
          title: 'AI is Thinking',
          message: 'Please wait while I process your message',
          icon: 'processing'
        };
      case 'speaking':
        return {
          title: 'AI is Speaking',
          message: transcript ? 'Speak anytime to interrupt' : `${Math.round(playbackProgress * 100)}% complete`,
          icon: 'speaker'
        };
      default:
        return {
          title: 'Ready to Listen',
          message: 'Click the microphone to start speaking',
          icon: 'mic'
        };
    }
  }
</script>

{#if visible}
  <div class="audio-mode" transition:fade={{ duration: 200 }}>
    <div class="audio-mode__content">
      <div class="audio-mode__icon-wrapper">
        {#if status === "recording"}
          <div class="audio-mode__icon-pulse"></div>
          <div class="audio-mode__icon-pulse"></div>
          <div class="audio-mode__icon-pulse"></div>
        {:else if status === "processing-speech" || status === "processing-ai"}
          <div class="audio-mode__processing"></div>
        {:else if status === "speaking"}
          <div class="audio-mode__waveform"></div>
          <div class="audio-mode__interrupt-hint" transition:fade={{duration: 200}}>
            Speak to interrupt
          </div>
        {/if}
        
        <div
          class="audio-mode__icon"
          class:recording={status === "recording"}
          class:processing={status === "processing-speech" || status === "processing-ai"}
          class:speaking={status === "speaking"}
          transition:scale={{ duration: 200 }}
        >
          {#if getStatusContent().icon === 'processing'}
            <svg viewBox="0 0 24 24" width="48" height="48" stroke="currentColor" stroke-width="1.5" fill="none">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
          {:else if getStatusContent().icon === 'speaker'}
            <svg viewBox="0 0 24 24" width="48" height="48" stroke="currentColor" stroke-width="1.5" fill="none">
              <path d="M12 6L8 10H4v4h4l4 4V6z" />
              <path d="M17 8a5 5 0 0 1 0 8" />
              <path d="M19 6a7 7 0 0 1 0 12" />
            </svg>
          {:else}
            <svg viewBox="0 0 24 24" width="48" height="48" stroke="currentColor" stroke-width="1.5" fill="none">
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="22" />
            </svg>
          {/if}
        </div>
      </div>
      
      <div class="audio-mode__text">
        <h3>{getStatusContent().title}</h3>
        <p>{getStatusContent().message}</p>
      </div>
    </div>

    <footer class="audio-mode__footer">
      <SpeechRecorder
        {language}
        on:result={handleSpeechResult}
        on:error={handleSpeechError}
        {updateRecordingStatus}
      />
      {#if status === 'speaking'}
        <button
          class="control-button"
          on:click={() => speechService.togglePause()}
          aria-label="Pause/Resume speech"
        >
          <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none">
            {#if speechService?.state?.isPaused}
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            {:else}
              <rect x="6" y="4" width="4" height="16"></rect>
              <rect x="14" y="4" width="4" height="16"></rect>
            {/if}
          </svg>
        </button>
      {/if}
      <button
        class="close-button"
        on:click={handleClose}
        aria-label="Close audio mode"
      >
        <svg
          viewBox="0 0 48 48"
          width="48"
          height="48"
          stroke="currentColor"
          stroke-width="2"
          fill="none"
        >
          <line x1="36" y1="12" x2="12" y2="36" />
          <line x1="12" y1="12" x2="36" y2="36" />
        </svg>
      </button>
    </footer>
  </div>
{/if}

<style>
  .audio-mode {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: var(--buildship-chat-widget-bg, #ffffff);
    z-index: 10;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 20px;
  }

  .close-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 60px;
    height: 60px;
    padding: 0;
    border: none;
    border-radius: 50%;
    background: var(--buildship-chat-button-bg, #f3f4f6);
    color: var(--buildship-chat-button-color, #6b7280);
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .close-button:hover {
    background: var(--buildship-chat-button-hover-bg, #e5e7eb);
    color: var(--buildship-chat-button-hover-color, #4b5563);
    transform: rotate(90deg);
  }

  .audio-mode__content {
    flex: 1;
    display: flex;
    flex-direction: column;
    color: var(--buildship-chat-text-color, #1f2937);
  }

  .audio-mode__icon-wrapper {
    position: relative;
    width: 120px;
    height: 120px;
    margin: 0 auto 24px;
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .audio-mode__icon {
    position: relative;
    z-index: 2;
    width: 80px;
    height: 80px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--buildship-chat-primary-color, #2563eb);
    color: white;
    border-radius: 50%;
    box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.1),
      0 2px 4px -1px rgba(37, 99, 235, 0.06);
    cursor: pointer;
  }

  .audio-mode__icon.recording {
    background: #ef4444;
  }

  .audio-mode__icon.processing {
    background: #f59e0b;
  }

  .audio-mode__icon.speaking {
    background: #10b981;
  }

  .audio-mode__icon-pulse {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 80px;
    height: 80px;
    background: #ef4444;
    border-radius: 50%;
    opacity: 0.6;
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }

  .audio-mode__icon-pulse:nth-child(2) {
    animation-delay: 0.5s;
  }

  .audio-mode__icon-pulse:nth-child(3) {
    animation-delay: 1s;
  }

  .audio-mode__processing {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 100px;
    height: 100px;
    border: 4px solid #f59e0b;
    border-top-color: transparent;
    border-radius: 50%;
    opacity: 0.6;
    animation: spin 1s linear infinite;
  }

  .audio-mode__waveform {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 100px;
    height: 100px;
    background: #10b981;
    border-radius: 50%;
    opacity: 0.2;
    animation: waveform 1.5s ease-in-out infinite;
  }

  .audio-mode__interrupt-hint {
    position: absolute;
    bottom: -30px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 0.875rem;
    color: var(--buildship-chat-text-secondary, #6b7280);
    white-space: nowrap;
    pointer-events: none;
  }

  .audio-mode__text {
    text-align: center;
  }

  .audio-mode__text h3 {
    font-size: 1.25rem;
    font-weight: 600;
    margin: 0 0 8px 0;
    color: var(--buildship-chat-primary-color, #2563eb);
  }

  .audio-mode__text p {
    font-size: 0.875rem;
    color: var(--buildship-chat-text-secondary, #6b7280);
    margin: 0;
    min-height: 2.5em;
  }

  .audio-mode__footer {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 28px;
    margin-top: 20px;
  }

  .control-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    padding: 0;
    border: none;
    border-radius: 50%;
    background: var(--buildship-chat-button-bg, #f3f4f6);
    color: var(--buildship-chat-button-color, #6b7280);
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .control-button:hover {
    background: var(--buildship-chat-button-hover-bg, #e5e7eb);
    color: var(--buildship-chat-button-hover-color, #4b5563);
  }

  @keyframes pulse {
    0% {
      transform: translate(-50%, -50%) scale(1);
      opacity: 0.6;
    }
    100% {
      transform: translate(-50%, -50%) scale(2);
      opacity: 0;
    }
  }

  @keyframes spin {
    0% {
      transform: translate(-50%, -50%) rotate(0deg);
    }
    100% {
      transform: translate(-50%, -50%) rotate(360deg);
    }
  }

  @keyframes waveform {
    0%, 100% {
      transform: translate(-50%, -50%) scale(1);
      opacity: 0.2;
    }
    50% {
      transform: translate(-50%, -50%) scale(1.5);
      opacity: 0.1;
    }
  }
</style>
