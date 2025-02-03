<script>
  import { onDestroy, onMount } from 'svelte'
  import Button from './components/Button.svelte'
  import WidgetContainer from './components/WidgetContainer.svelte'
  import Backdrop from './components/Backdrop.svelte'
  import Widget from './components/Widget.svelte'
  import { MessageService } from './services/MessageService'
  import { SpeechToTextService } from './services/SpeechToTextService'
  import { DEFAULT_CONFIG } from './constants/settings'
  import { MessageRoles } from './types/messages'
  import './ui/styles/widget.css'

  // Props
  export let config = {}
  export let onSubmit = null
  export let onClose = null
  export let onMicClick = null

  // Internal state
  let isInitialized = false
  let buttonComponent
  let widgetComponent
  let isOpen = false
  let isRecording = false
  let messages = []
  let isProcessing = false
  let showTyping = false
  let isLoading = false
  let error = null

  // Services
  const mergedConfig = { ...DEFAULT_CONFIG, ...config }
  const messageService = new MessageService({
    config: mergedConfig,
    onSubmit,
    onClose,
    appendMessage: (message) => {
      messages = [...messages, message]
    },
    setProcessing: (value) => isProcessing = value,
    showTypingIndicator: () => showTyping = true,
    hideTypingIndicator: () => showTyping = false
  })

  const speechService = new SpeechToTextService({
    language: mergedConfig.language
  })

  onMount(() => {
    if (config.openOnLoad) {
      isOpen = true
    }
  })

  onDestroy(() => {
    if (isRecording) {
      speechService.stop()
    }
  })

  async function handleMessageSubmit(event) {
    const message = event.detail
    if (!message.trim()) return

    try {
      error = null
      isLoading = true

      // Add user message
      const userMessage = {
        id: Date.now().toString(),
        content: message,
        role: MessageRoles.USER,
        timestamp: new Date()
      }
      messages = [...messages, userMessage]

      // Process message
      await messageService.handleSubmit(message)
    } catch (err) {
      error = err.message || 'Failed to send message'
      console.error('Error sending message:', err)
    } finally {
      isLoading = false
    }
  }

  function handleStartRecording() {
    if (!speechService) return

    try {
      error = null
      isRecording = true
      speechService.start((result) => {
        if (result.isFinal) {
          handleMessageSubmit({ detail: result.transcript })
          isRecording = false
          speechService.stop()
        }
      })
    } catch (err) {
      error = err.message || 'Failed to start recording'
      console.error('Error starting recording:', err)
      isRecording = false
    }
  }

  function handleStopRecording() {
    if (!speechService) return

    try {
      isRecording = false
      speechService.stop()
    } catch (err) {
      error = err.message || 'Failed to stop recording'
      console.error('Error stopping recording:', err)
    }
  }

  function handleClose() {
    isOpen = false
    messageService.handleClose()
  }
</script>

{#if mergedConfig.mode === 'fullscreen'}
  <div class="chat-widget--fullscreen">
    <Widget
      title={mergedConfig.title}
      mode={mergedConfig.mode}
      {messages}
      {isRecording}
      {isProcessing}
      {showTyping}
      {isLoading}
      {error}
      on:close={handleClose}
      on:submit={handleMessageSubmit}
      on:startRecording={handleStartRecording}
      on:stopRecording={handleStopRecording}
    />
  </div>
{:else}
  <div class="chat-widget-container">
    {#if !isOpen}
      <Button
        bind:this={buttonComponent}
        onClick={() => isOpen = true}
        disabled={isProcessing}
      />
    {/if}

    {#if isOpen}
      <Backdrop onClick={handleClose} />
      <WidgetContainer
        bind:this={widgetComponent}
        {isOpen}
        widgetPosition={mergedConfig.widgetPosition}
        referenceElement={buttonComponent?.buttonContainer}
      >
        <Widget
          title={mergedConfig.title}
          mode={mergedConfig.mode}
          {messages}
          {isRecording}
          {isProcessing}
          {showTyping}
          {isLoading}
          {error}
          on:close={handleClose}
          on:submit={handleMessageSubmit}
          on:startRecording={handleStartRecording}
          on:stopRecording={handleStopRecording}
        />
      </WidgetContainer>
    {/if}
  </div>
{/if}

<style>
  .chat-widget-container {
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 9999;
  }
</style>
