<script>
  import Header from './Header.svelte'
  import MessageList from './MessageList.svelte'
  import Input from './Input.svelte'
  import { createEventDispatcher } from 'svelte'

  export let title = 'Chat'
  export let messages = []
  export let isRecording = false

  const dispatch = createEventDispatcher()

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
</script>

<div class="chat-widget">
  <Header {title} onClose={handleClose} />
  
  <MessageList {messages} />
  
  <Input
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
