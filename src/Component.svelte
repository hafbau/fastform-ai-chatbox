<script>
  import { onMount, onDestroy } from "svelte"
  import { getContext } from "svelte"
  import chatWidget from "./chat-widget/src/index"

  // Props from schema.json settings
  export let url = ""
  export let widgetTitle = "Ask Neil"
  export let greetingMessage = "Hello! How can I help you today?"
  export let responseIsAStream = false
  export let disableErrorAlert = false
  export let closeOnOutsideClick = true
  export let openOnLoad = false
  export let isPopover = false
  export let inPage = false
  export let enableAudioInput = true
  export let autoSendAudioMessage = true

  // Get SDK context
  const { styleable, Provider } = getContext("sdk")
  const component = getContext("component")

  // State for chat widget
  let chatButton
  let isInitialized = false

  // Initialize chat widget
  onMount(async () => {
    // Configure the widget
    chatWidget.config.url = url
    chatWidget.config.widgetTitle = widgetTitle
    chatWidget.config.greetingMessage = greetingMessage
    chatWidget.config.responseIsAStream = responseIsAStream
    chatWidget.config.disableErrorAlert = disableErrorAlert
    chatWidget.config.closeOnOutsideClick = closeOnOutsideClick
    chatWidget.config.openOnLoad = openOnLoad
    chatWidget.config.isPopover = isPopover
    chatWidget.config.inPage = inPage
    chatWidget.config.enableAudioInput = enableAudioInput
    chatWidget.config.autoSendAudioMessage = autoSendAudioMessage

    // Initialize the widget
    await chatWidget.init()
    isInitialized = true

    // Open on load if configured
    if (openOnLoad) {
      chatWidget.open({ target: chatButton })
    }
  })

  // Cleanup on component destroy
  onDestroy(() => {
    if (isInitialized) {
      chatWidget.close()
    }
  })

  // Handle button click
  function handleClick() {
    if (isInitialized) {
      chatWidget.open({ target: chatButton })
    }
  }
</script>

<div use:styleable={$component.styles}>
  <button
    bind:this={chatButton}
    data-buildship-chat-widget-button
    on:click={handleClick}
    class="chat-button"
  >
    <slot>Chat with AI</slot>
  </button>
</div>

<style>
  .chat-button {
    position: fixed;
    bottom: 20px;
    right: 20px;
    padding: 12px 24px;
    border-radius: 25px;
    background-color: #007bff;
    color: white;
    border: none;
    cursor: pointer;
    font-size: 16px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
  }

  .chat-button:hover {
    background-color: #0056b3;
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
  }
</style>
