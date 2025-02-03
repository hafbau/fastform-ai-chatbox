<script>
  import { createEventDispatcher, onMount } from 'svelte'
  import MessageList from './MessageList.svelte'
  import Input from './Input.svelte'
  import Header from './Header.svelte'
  import AudioMode from './AudioMode.svelte'

  export let title = 'Chat'
  export let messages = []
  export let isRecording = false
  export let isProcessing = false
  export let showTyping = false
  export let isLoading = false
  export let error = null
  export let mode = 'fullscreen'

  const dispatch = createEventDispatcher()
  let inputComponent
  let lastFocusedElement
  let isAudioMode = false
  let aiResponse = ''

  onMount(() => {
    lastFocusedElement = document.activeElement
    inputComponent?.focus?.()

    return () => {
      if (lastFocusedElement) {
        lastFocusedElement.focus?.()
      }
    }
  })

  function handleClose() {
    if (isRecording) {
      handleStopRecording()
    }
    if (mode === 'fullscreen') return
    dispatch('close')
  }

  function handleSubmit(event) {
    const message = event.detail
    dispatch('submit', { message })
  }

  function handleStartRecording() {
    isRecording = true
    dispatch('startRecording')
  }

  function handleStopRecording() {
    isRecording = false
    dispatch('stopRecording')
  }

  function handleKeydown(event) {
    if (event.key === 'Escape') {
      handleClose()
    }
  }

  function openAudioMode() {
    isAudioMode = true
    dispatch('startRecording')
  }

  function handleAIResponse(event) {
    aiResponse = event.detail.message
  }

  function handleSpeakingComplete() {
    aiResponse = ''
  }

  function handleInterruption() {
    // Clear the current AI response when user interrupts
    aiResponse = ''
    // Optionally notify parent that user interrupted AI
    dispatch('interrupted')
  }
</script>

<div 
  class="chat-widget"
  on:keydown={handleKeydown}
  role="dialog"
  aria-label={title}
>
  <Header {title} onClose={handleClose} isCloseButtonVisible={mode !== 'fullscreen'} />
  
  <div class="chat-widget__content">
    <AudioMode 
      visible={isAudioMode}
      isProcessing={isProcessing}
      aiResponse={aiResponse}
      on:close={() => {
        isAudioMode = false
        handleStopRecording()
      }}
      on:submit={handleSubmit}
      on:error
      on:speakingComplete={handleSpeakingComplete}
      on:interrupted={handleInterruption}
    />
    <MessageList {messages} {isAudioMode} />
    
    <Input
      bind:this={inputComponent}
      {isRecording}
      {isProcessing}
      disabled={isLoading}
      openAudioMode={openAudioMode}
      on:submit={handleSubmit}
      on:startRecording={handleStartRecording}
      on:stopRecording={handleStopRecording}
    />
  </div>
</div>

<style>
  .chat-widget {
    display: flex;
    flex-direction: column;
    flex: 1;
    background: var(--buildship-chat-widget-bg, #ffffff);
  }

  .chat-widget__content {
    position: relative;
    display: flex;
    flex-direction: column;
    flex: 1;
    overflow: hidden;
  }
</style>
