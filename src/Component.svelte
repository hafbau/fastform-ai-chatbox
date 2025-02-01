<script>
  import { onMount, onDestroy } from "svelte"
  import { getContext } from "svelte"
  import { ChatWidget } from "./chat-widget/src/index"

  export let url = ""
  export let widgetTitle = "Chat"
  export let greetingMessage = "Hello! How can I help you today?"
  export let responseIsAStream = false
  export let disableErrorAlert = false
  export let mode = "fullscreen"
  export let buttonPosition = "bottom-right"
  export let widgetPosition = "right"
  export let buttonFixed = true
  export let widgetFixed = true
  export let showBackdrop = true
  export let openOnLoad = false

  const { styleable } = getContext("sdk")
  const component = getContext("component")

  let isInitialized = false
  let chatWidget
  let container
  let buttonContainer
  let mounted = false
  let isOpen = false

  // Helper to get button position styles
  $: buttonStyles = buttonPosition === 'custom' ? {} : {
    'top-left': { top: '20px', left: '20px' },
    'top-right': { top: '20px', right: '20px' },
    'bottom-left': { bottom: '20px', left: '20px' },
    'bottom-right': { bottom: '20px', right: '20px' }
  }[buttonPosition] || {}

  // Helper to get widget position styles
  $: widgetStyles = widgetPosition === 'custom' ? {} : {
    'top': { top: '20px', left: '20px', right: '20px' },
    'right': { top: '20px', right: '20px', bottom: '20px' },
    'bottom': { bottom: '20px', left: '20px', right: '20px' },
    'left': { top: '20px', left: '20px', bottom: '20px' }
  }[widgetPosition] || {}

  onMount(async () => {
    mounted = true
    initWidget()
  })

  function initWidget() {
    const config = {
      url,
      title: widgetTitle,
      greetingMessage,
      responseIsAStream,
      disableErrorAlert,
      mode,
      buttonPosition,
      widgetPosition,
      buttonFixed,
      widgetFixed,
      showBackdrop
    }

    chatWidget = new ChatWidget(config)

    if (mode === 'fullscreen') {
      if (!container) {
        console.error('Container element not found for fullscreen mode')
        return
      }
      chatWidget.mount(container)
      isOpen = true
      chatWidget.show()
    } else {
      if (!buttonContainer) {
        console.error('Button container element not found for widget mode')
        return
      }
      chatWidget.mount(buttonContainer)
      isOpen = openOnLoad
      if (openOnLoad) {
        chatWidget.show()
      }
    }

    isInitialized = true
  }

  onDestroy(() => {
    if (isInitialized && chatWidget) {
      chatWidget.destroy()
    }
  })

  function handleClick() {
    if (isInitialized && chatWidget && mode === 'widget') {
      isOpen = !isOpen
      if (isOpen) {
        chatWidget.show()
      } else {
        chatWidget.hide()
      }
    }
  }

  $: if ($component && mounted) {
    if (isInitialized && chatWidget) {
      chatWidget.destroy()
      isInitialized = false
    }
    initWidget()
  }
</script>

{#if mode === 'fullscreen'}
  <div class="chat-widget--fullscreen" bind:this={container} use:styleable={$component.styles} />
{:else}
  <div class="chat-widget-container" bind:this={buttonContainer}>
    <button
      class="chat-button"
      class:chat-button--fixed={buttonFixed}
      style={Object.entries(buttonStyles).map(([key, value]) => `${key}: ${value}`).join(';')}
      on:click={handleClick}
      aria-label="Toggle chat"
      aria-expanded={isOpen}
      use:styleable={$component.styles}
    >
      <slot>Chat</slot>
    </button>

    {#if showBackdrop && isOpen}
      <button 
        class="chat-backdrop"
        class:chat-backdrop--fixed={widgetFixed}
        on:click={() => handleClick()}
        aria-label="Close chat"
      />
    {/if}

    <div
      class="chat-widget chat-widget--widget"
      class:chat-widget--fixed={widgetFixed}
      class:chat-widget--open={isOpen}
      style={Object.entries(widgetStyles).map(([key, value]) => `${key}: ${value}`).join(';')}
      role="dialog"
      aria-modal={isOpen}
      aria-hidden={!isOpen}
      use:styleable={$component.styles}
    />
  </div>
{/if}

<style>
  .chat-widget--fullscreen {
    height: 100%;
    width: 100%;
  }

  .chat-widget--widget {
    position: absolute;
    min-width: 320px;
    min-height: 480px;
    max-width: 90vw;
    max-height: 90vh;
    visibility: hidden;
    opacity: 0;
    transform: scale(0.95);
    transition: all 0.2s ease;
  }

  .chat-widget--fixed {
    position: fixed;
  }

  .chat-widget--open {
    visibility: visible;
    opacity: 1;
    transform: scale(1);
  }

  .chat-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 12px 24px;
    border-radius: 9999px;
    background-color: #0066FF;
    color: white;
    border: none;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    position: relative;
  }

  .chat-button--fixed {
    position: fixed;
  }

  .chat-backdrop {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    opacity: 0;
    visibility: hidden;
    transition: all 0.2s ease;
    border: none;
    padding: 0;
    margin: 0;
    cursor: pointer;
  }

  .chat-backdrop--fixed {
    position: fixed;
  }

  .chat-widget--open ~ .chat-backdrop {
    opacity: 1;
    visibility: visible;
  }
</style>
