<script>
  import { createEventDispatcher } from 'svelte'
  import { scale } from 'svelte/transition'
  import SpeechRecorder from './SpeechRecorder.svelte'

  export let placeholder = 'Type a message...'
  export let maxHeight = 150
  export let minHeight = 54
  export let isProcessing = false
  export let openAudioMode = () => {}
  export let disabled = false

  const dispatch = createEventDispatcher()
  let textarea
  let input = ''

  function autoGrow() {
    if (!textarea) return
    textarea.style.height = 'auto'
    const newHeight = Math.min(Math.max(textarea.scrollHeight, minHeight), maxHeight)
    textarea.style.height = `${newHeight}px`
  }

  function handleKeyDown(event) {
    if (event.key === 'Enter' && !event.shiftKey && input.trim()) {
      event.preventDefault()
      dispatch('submit', input.trim())
      input = ''
    }
  }

  function handleSubmit() {
    if (input.trim()) {
      dispatch('submit', input.trim())
      input = ''
    }
  }

  function handleSpeechResult(event) {
    const { transcript, isFinal } = event.detail
    if (isFinal) {
      input = transcript
      handleSubmit()
    }
  }

  function handleSpeechError(event) {
    dispatch('error', event.detail)
  }

  export function focus() {
    textarea?.focus()
  }
</script>

<div class="input-area">
  <div class="textarea-wrapper">
    <textarea
      bind:this={textarea}
      bind:value={input}
      on:input={autoGrow}
      on:keydown={handleKeyDown}
      {placeholder}
      rows="1"
      disabled={isProcessing || disabled}
    />
    
    <button
      class="speech-button"
      on:click={openAudioMode}
      disabled={isProcessing || disabled}
      title={'Use audio mode'}
    >
      <div class="icon" transition:scale={{ duration: 200 }}>
        <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none">
          <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
          <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
          <line x1="12" y1="19" x2="12" y2="22" />
        </svg>
      </div>
    </button>
  </div>
  
  <button 
    class="send-button" 
    on:click={handleSubmit}
    disabled={isProcessing || !input.trim() || disabled}
  >
    <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  </button>
</div>

<style>
  .input-area {
    display: flex;
    gap: 8px;
    padding: 12px;
    background: var(--buildship-chat-input-bg, #ffffff);
    border-top: 1px solid var(--buildship-chat-border-color, #e5e7eb);
  }

  .textarea-wrapper {
    position: relative;
    flex: 1;
    display: flex;
  }

  textarea {
    flex: 1;
    min-height: 40px;
    padding: 8px 12px;
    border: 1px solid var(--buildship-chat-border-color, #e5e7eb);
    border-radius: 20px;
    background: var(--buildship-chat-textarea-bg, #f9fafb);
    color: var(--buildship-chat-text-color, #1f2937);
    font-size: 14px;
    line-height: 1.5;
    resize: none;
    overflow-y: auto;
  }

  textarea:focus {
    outline: none;
    border-color: var(--buildship-chat-primary-color, #2563eb);
    box-shadow: 0 0 0 2px var(--buildship-chat-primary-color-alpha, rgba(37, 99, 235, 0.1));
  }

  .send-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    padding: 0;
    border: none;
    border-radius: 20px;
    background: var(--buildship-chat-button-bg, #f3f4f6);
    color: var(--buildship-chat-button-color, #6b7280);
    cursor: pointer;
    transition: all 0.2s;
  }

  .send-button:hover {
    background: var(--buildship-chat-button-hover-bg, #e5e7eb);
    color: var(--buildship-chat-button-hover-color, #4b5563);
  }

  .send-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>
