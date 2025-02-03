<script>
  import { fade } from 'svelte/transition'
  import Widget from './components/Widget.svelte'
  import Button from './components/Button.svelte'
  import WidgetContainer from './components/WidgetContainer.svelte'
  import Backdrop from './components/Backdrop.svelte'
  import { DEFAULT_CONFIG } from './constants/settings'
  import './ui/styles/widget.css'

  export let config = {}
  const mergedConfig = { ...DEFAULT_CONFIG, ...config }

  let isOpen = false
  let buttonComponent
  let widgetComponent
  let error = null

  // Handle display mode orchestration
  $: isFullscreen = mergedConfig.mode === 'fullscreen'

  function handleClose() {
    if (isFullscreen) return
    isOpen = false
    config.onClose?.()
  }

  function handleError(event) {
    error = event.detail
  }
</script>

{#if isFullscreen}
  <div class="chat-widget--fullscreen">
    <Widget
      config={mergedConfig}
      on:close={handleClose}
      on:error={handleError}
    />
  </div>
{:else}
  <div class="chat-widget-container">
    {#if !isOpen}
      <Button
        bind:this={buttonComponent}
        onClick={() => isOpen = true}
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
        <div class="chat-widget--widget chat-widget--open">
          <Widget
            config={mergedConfig}
            on:close={handleClose}
            on:error={handleError}
          />
        </div>
      </WidgetContainer>
    {/if}
  </div>
{/if}

{#if error}
  <div class="error" transition:fade>
    {error}
  </div>
{/if}

<style>
  .chat-widget-container {
    position: fixed;
    z-index: 9999;
    bottom: 20px;
    right: 20px;
  }

  .error {
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: var(--buildship-chat-error-bg, #ef4444);
    color: var(--buildship-chat-error-color, #ffffff);
    padding: 12px 20px;
    border-radius: 8px;
    z-index: 10000;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
</style>
