<script>
  import { createEventDispatcher, onMount, onDestroy } from "svelte";
  import { fade, scale } from 'svelte/transition';

  export let language = "en-US";
  export let updateRecordingStatus;

  let isRecording = true; // Start recording by default
  let recognition = null;
  let transcript = "";
  const dispatch = createEventDispatcher();

  onMount(() => {
    initializeSpeechRecognition();
    startRecording(); // Start recording immediately when mounted
  });

  onDestroy(() => {
    stopRecognition();
  });

  function initializeSpeechRecognition() {
    if (!window.SpeechRecognition && !window.webkitSpeechRecognition) {
      dispatch("error", "Speech recognition is not supported in this browser.");
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = language;

    recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      const currentTranscript = finalTranscript || interimTranscript;
      transcript = currentTranscript;
      
      dispatch("result", {
        transcript: currentTranscript,
        isFinal: !!finalTranscript
      });
    };

    recognition.onerror = (event) => {
      dispatch("error", event.error);
    };

    recognition.onend = () => {
      if (isRecording) {
        stopRecording();
      }
    };
  }

  function startRecognition() {
    if (!recognition) return;
    try {
      recognition.start();
    } catch (error) {
      if (error.name === 'NotAllowedError') {
        dispatch("error", "Microphone permission denied");
      } else {
        console.error('Speech recognition error:', error);
        dispatch("error", error.message);
      }
    }
  }

  function stopRecognition() {
    if (!recognition) return;
    try {
      recognition.stop();
    } catch (error) {
      console.error('Error stopping recognition:', error);
    }
  }

  function toggleRecording() {
    if (!recognition) return;
    
    isRecording = !isRecording;
    if (isRecording) {
      startRecording();
    } else {
      stopRecording({stopped: true});
    }
  }

  function startRecording() {
    isRecording = true;
    updateRecordingStatus(true, false);
    startRecognition();
  }

  function stopRecording({stopped = false} = {}) {
    isRecording = false;
    updateRecordingStatus(false, stopped);
    stopRecognition();
    transcript = "";
  }
</script>

<button
  class="speech-button"
  class:recording={isRecording}
  on:click={toggleRecording}
  aria-label={isRecording ? "Stop recording" : "Start recording"}
>
  <div class="icon" transition:scale={{ duration: 200 }}>
    {#if isRecording}
      <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none">
        <rect x="4" y="4" width="16" height="16" rx="2" />
      </svg>
    {:else}
      <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none">
        <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
        <line x1="12" y1="19" x2="12" y2="22" />
      </svg>
    {/if}
  </div>
  {#if isRecording}
    <div class="pulse-ring" transition:fade={{ duration: 200 }}></div>
  {/if}
</button>

<style>
  .speech-button {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 60px;
    height: 60px;
    padding: 0;
    border: none;
    border-radius: 20px;
    background: var(--buildship-chat-button-bg, #f3f4f6);
    color: var(--buildship-chat-button-color, #6b7280);
    cursor: pointer;
    transition: all 0.2s;
  }

  .speech-button:hover {
    background: var(--buildship-chat-button-hover-bg, #e5e7eb);
    color: var(--buildship-chat-button-hover-color, #4b5563);
  }

  .speech-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .speech-button.recording {
    background: var(--buildship-chat-primary-color, #2563eb);
    color: white;
  }

  .icon {
    position: relative;
    z-index: 1;
  }

  .pulse-ring {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 50%;
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }

  @keyframes pulse {
    0% {
      box-shadow: 0 0 0 0 rgba(37, 99, 235, 0.4);
    }
    70% {
      box-shadow: 0 0 0 10px rgba(37, 99, 235, 0);
    }
    100% {
      box-shadow: 0 0 0 0 rgba(37, 99, 235, 0);
    }
  }
</style>
