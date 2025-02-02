<script>
  import { onDestroy } from 'svelte'
  import Button from './components/Button.svelte'
  import WidgetContainer from './components/WidgetContainer.svelte'
  import Backdrop from './components/Backdrop.svelte'
  import Widget from './components/Widget.svelte'
  import { MessageService } from './services/MessageService'
  import { SpeechService } from './services/SpeechService'
  import { DEFAULT_CONFIG } from './constants/settings'
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

  const speechService = new SpeechService({
    config: mergedConfig,
    onMicClick,
    onResult: (text) => {
      if (onSubmit) onSubmit(text)
    },
    setRecording: (value) => isRecording = value
  })

  function handleWidgetClose() {
    isOpen = false
    widgetComponent?.stopPositioning()
    if (onClose) onClose()
  }

  function handleMessageSubmit(event) {
    const content = event.detail
    messageService.handleSubmit(content)
  }

  function handleStartRecording() {
    speechService.startRecording()
  }

  function handleStopRecording() {
    speechService.stopRecording()
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
    speechService.cleanup()
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
      on:close={handleWidgetClose}
      on:submit={handleMessageSubmit}
      on:startRecording={handleStartRecording}
      on:stopRecording={handleStopRecording}
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
        on:close={handleWidgetClose}
        on:submit={handleMessageSubmit}
        on:startRecording={handleStartRecording}
        on:stopRecording={handleStopRecording}
      />
    </WidgetContainer>
  </div>
{/if}
