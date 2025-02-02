<script>
  import { createEventDispatcher, onMount } from 'svelte'
  import MessageList from './MessageList.svelte'
  import Input from './Input.svelte'
  import Header from './Header.svelte'

  export let title = 'Chat'
  export let messages = []
  export let isRecording = false

  const dispatch = createEventDispatcher()
  let inputComponent
  let lastFocusedElement

  onMount(() => {
    lastFocusedElement = document.activeElement
    inputComponent?.focus()

    return () => {
      if (lastFocusedElement) {
        lastFocusedElement.focus()
      }
    }
  })

  function handleClose() {
    dispatch('close')
  }

  function handleSubmit(event) {
    dispatch('submit', event.detail)
  }

  function handleStartRecording() {
    dispatch('startRecording')
  }

  function handleStopRecording() {
    dispatch('stopRecording')
  }

  function handleKeydown(event) {
    if (event.key === 'Escape') {
      dispatch('close')
    }
  }
</script>

<div 
  class="chat-widget"
  on:keydown={handleKeydown}
  role="dialog"
  aria-label={title}
>
  <Header {title} onClose={handleClose} />
  
  <MessageList {messages} />
  
  <Input
    bind:this={inputComponent}
    {isRecording}
    on:submit={handleSubmit}
    on:startRecording={handleStartRecording}
    on:stopRecording={handleStopRecording}
  />
</div>

<style>
  .chat-widget {
    display: flex;
    flex-direction: column;
    flex: 1;
    background: var(--buildship-chat-widget-bg, #ffffff);
  }
</style>
