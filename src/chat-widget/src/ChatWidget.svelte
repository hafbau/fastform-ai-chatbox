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
    appendMessage,
    setProcessing: (value) => isProcessing = value,
    showTypingIndicator: () => showTyping = true,
    hideTypingIndicator: () => showTyping = false
  })

  const speechService = new SpeechToTextService({
    language: mergedConfig.language
  })

  onMount(() => {
    if (config.openOnLoad) {
      widgetComponent?.show()
    }
  })

  async function handleMessageSubmit(event) {
    const message = event.detail
    if (!message.trim()) return

    try {
      error = null
      isLoading = true

      // Add user message
      messages = [...messages, {
        id: Date.now(),
        content: message,
        role: MessageRoles.USER,
        timestamp: new Date()
      }]

      // Get assistant response
      const response = await messageService.handleSubmit(message)
      
      // Add assistant message
      messages = [...messages, {
        id: Date.now(),
        content: response,
        role: MessageRoles.ASSISTANT,
        timestamp: new Date()
      }]
    } catch (err) {
      error = err.message || 'Failed to send message'
      console.error('Error sending message:', err)
    } finally {
      isLoading = false
    }
  }

  function handleStartRecording() {
    try {
      error = null
      isRecording = true
      speechService.startRecording()
    } catch (err) {
      error = err.message || 'Failed to start recording'
      console.error('Error starting recording:', err)
      isRecording = false
    }
  }

  function handleStopRecording() {
    try {
      isRecording = false
      speechService.stopRecording()
    } catch (err) {
      error = err.message || 'Failed to stop recording'
      console.error('Error stopping recording:', err)
    }
  }

  function handleSpeechResult(event) {
    const { transcript } = event.detail
    if (transcript) {
      handleMessageSubmit({ detail: transcript })
    }
  }

  function handleWidgetClose() {
    isOpen = false
    widgetComponent?.stopPositioning()
    if (onClose) onClose()
  }

  function handleClick() {
    if (mergedConfig.mode === 'widget') {
      isOpen = !isOpen
      if (isOpen) {
        widgetComponent?.startPositioning()
      } else {
        widgetComponent?.stopPositioning()
      }
    }
  }

  function appendMessage(message) {
    messages = [...messages, message]
  }

  onDestroy(() => {
    buttonComponent?.cleanup()
    speechService.destroy()
  })
</script>

{#if mergedConfig.mode === 'fullscreen'}
  <div class="chat-widget--fullscreen">
    <Widget
      title={mergedConfig.title}
      {messages}
      {isRecording}
      {isProcessing}
      {showTyping}
      {isLoading}
      {error}
      on:close={handleWidgetClose}
      on:submit={handleMessageSubmit}
      on:startRecording={handleStartRecording}
      on:stopRecording={handleStopRecording}
      on:speechResult={handleSpeechResult}
    />
  </div>
{:else}
  <div class="chat-widget-container">
    <Button
      bind:this={buttonComponent}
      buttonPosition={mergedConfig.buttonPosition}
      {isOpen}
      on:click={handleClick}
    >
      AI Chat
    </Button>

    <Backdrop {isOpen} on:click={handleWidgetClose} />

    <WidgetContainer
      bind:this={widgetComponent}
      {isOpen}
      widgetPosition={mergedConfig.widgetPosition}
      referenceElement={buttonComponent?.buttonContainer}
    >
      <Widget
        title={mergedConfig.title}
        {messages}
        {isRecording}
        {isProcessing}
        {showTyping}
        {isLoading}
        {error}
        on:close={handleWidgetClose}
        on:submit={handleMessageSubmit}
        on:startRecording={handleStartRecording}
        on:stopRecording={handleStopRecording}
        on:speechResult={handleSpeechResult}
      />
    </WidgetContainer>
  </div>
{/if}
