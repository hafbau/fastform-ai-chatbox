<script>
  import { onMount } from 'svelte'
  import { createEventDispatcher } from 'svelte'

  export let placeholder = 'Type a message...'
  export let maxHeight = 150
  export let isRecording = false

  const dispatch = createEventDispatcher()
  let textarea
  let recording = false
  let waveformAnimation

  function autoGrow() {
    if (!textarea) return
    textarea.style.height = 'auto'
    const newHeight = Math.min(textarea.scrollHeight, maxHeight)
    textarea.style.height = newHeight + 'px'
  }

  function handleKeydown(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      handleSubmit()
    }
  }

  function handleSubmit() {
    if (!textarea.value.trim()) return
    dispatch('submit', textarea.value)
    textarea.value = ''
    autoGrow()
  }

  function toggleRecording() {
    recording = !recording
    if (recording) {
      startWaveform()
      dispatch('startRecording')
    } else {
      stopWaveform()
      dispatch('stopRecording')
    }
  }

  function startWaveform() {
    const canvas = document.getElementById('waveform')
    const ctx = canvas.getContext('2d')
    const width = canvas.width
    const height = canvas.height
    let x = 0

    waveformAnimation = requestAnimationFrame(function draw() {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'
      ctx.fillRect(0, 0, width, height)
      
      // Draw waveform
      ctx.beginPath()
      ctx.moveTo(x, height / 2)
      
      for (let i = 0; i < width; i++) {
        const y = height / 2 + Math.sin(i * 0.05 + x * 0.1) * 20 * Math.random()
        ctx.lineTo(i, y)
      }
      
      ctx.strokeStyle = '#0066FF'
      ctx.lineWidth = 2
      ctx.stroke()
      
      x += 2
      if (recording) {
        waveformAnimation = requestAnimationFrame(draw)
      }
    })
  }

  function stopWaveform() {
    if (waveformAnimation) {
      cancelAnimationFrame(waveformAnimation)
    }
    const canvas = document.getElementById('waveform')
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }

  onMount(() => {
    autoGrow()
  })
</script>

<div class="input-container">
  <div class="textarea-wrapper">
    <textarea
      bind:this={textarea}
      on:input={autoGrow}
      on:keydown={handleKeydown}
      {placeholder}
      rows="1"
      maxlength="1000"
    ></textarea>
    
    <button 
      class="mic-button" 
      class:recording 
      on:click={toggleRecording}
      aria-label={recording ? 'Stop recording' : 'Start recording'}
    >
      <div class="mic-icon">
        <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
          <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
          <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
        </svg>
      </div>
      {#if recording}
        <canvas id="waveform" width="120" height="40"></canvas>
      {/if}
    </button>
  </div>
  
  <button 
    class="send-button"
    on:click={handleSubmit}
    aria-label="Send message"
  >
    <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
    </svg>
  </button>
</div>

<style>
  .input-container {
    padding: 12px;
    background: var(--buildship-chat-widget-input-bg, #ffffff);
    border-top: 1px solid var(--buildship-chat-widget-border-color, rgba(0, 0, 0, 0.1));
    display: flex;
    gap: 8px;
    align-items: flex-end;
  }

  .textarea-wrapper {
    flex: 1;
    display: flex;
    align-items: flex-end;
    gap: 8px;
    background: var(--buildship-chat-widget-textarea-bg, #f0f2f5);
    border-radius: 20px;
    padding: 8px 16px;
  }

  textarea {
    flex: 1;
    border: none;
    background: transparent;
    resize: none;
    padding: 0;
    font-size: 14px;
    line-height: 1.5;
    max-height: var(--buildship-chat-widget-input-max-height, 150px);
    color: var(--buildship-chat-widget-input-text, #1c1c1c);
  }

  textarea:focus {
    outline: none;
  }

  .mic-button {
    background: transparent;
    border: none;
    padding: 6px;
    cursor: pointer;
    border-radius: 50%;
    color: var(--buildship-chat-widget-mic-color, #6b7280);
    display: flex;
    align-items: center;
    gap: 8px;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .mic-button:hover {
    color: var(--buildship-chat-widget-mic-hover, #0066FF);
  }

  .mic-button.recording {
    color: var(--buildship-chat-widget-mic-active, #0066FF);
    background: var(--buildship-chat-widget-mic-active-bg, rgba(0, 102, 255, 0.1));
  }

  .send-button {
    background: var(--buildship-chat-widget-send-bg, #0066FF);
    border: none;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: white;
    transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .send-button:hover {
    transform: scale(1.05);
  }

  .send-button:active {
    transform: scale(0.95);
  }

  canvas {
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.1);
  }

  @keyframes pulse {
    0% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.1);
    }
    100% {
      transform: scale(1);
    }
  }

  .recording .mic-icon {
    animation: pulse 1.5s infinite;
  }
</style>
