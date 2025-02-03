<script>
  import ChatWidget from './chat-widget/src/ChatWidget.svelte'
  import { DEFAULT_CONFIG } from './chat-widget/src'

  export let url = ''
  export let title = 'AI Chat'
  export let greetingMessage = ''
  export let appendContext = ''
  export let responseIsAStream = false
  export let disableErrorAlert = false
  export let mode = 'widget'
  export let buttonPosition = 'bottom-right'
  export let widgetPosition = 'right'
  export let openOnLoad = false

  const config = {
    ...DEFAULT_CONFIG,
    url,
    title,
    greetingMessage,
    appendContext,
    responseIsAStream,
    disableErrorAlert,
    mode,
    buttonPosition,
    widgetPosition,
    openOnLoad
  }

  function handleSubmit(event) {
    console.log('Message submitted:', event.detail)
  }

  function handleClose() {
    console.log('Widget closed')
  }

  function handleMicClick(event) {
    console.log('Mic clicked:', event)
  }
</script>

<ChatWidget
  {config}
  on:submit={handleSubmit}
  on:close={handleClose}
  on:micClick={handleMicClick}
/>
