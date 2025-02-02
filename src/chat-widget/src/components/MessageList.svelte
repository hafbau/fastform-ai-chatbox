<script>
  import Message from './Message.svelte'
  import { onMount } from 'svelte'

  export let messages = []
  let messageContainer

  onMount(() => {
    scrollToBottom()
  })

  $: if (messages) {
    // Wait for DOM update
    setTimeout(scrollToBottom, 0)
  }

  function scrollToBottom() {
    if (messageContainer) {
      messageContainer.scrollTop = messageContainer.scrollHeight
    }
  }
</script>

<div class="message-list" bind:this={messageContainer}>
  {#each messages as message (message.id)}
    <Message
      message={message.content}
      isUser={message.isUser}
      timestamp={message.timestamp}
    />
  {/each}
</div>

<style>
  .message-list {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
    scroll-behavior: smooth;
  }

  /* Custom scrollbar */
  .message-list::-webkit-scrollbar {
    width: 6px;
  }

  .message-list::-webkit-scrollbar-track {
    background: var(--buildship-chat-widget-scrollbar-track, rgba(0, 0, 0, 0.05));
  }

  .message-list::-webkit-scrollbar-thumb {
    background: var(--buildship-chat-widget-scrollbar-thumb, rgba(0, 0, 0, 0.2));
    border-radius: 3px;
  }

  .message-list::-webkit-scrollbar-thumb:hover {
    background: var(--buildship-chat-widget-scrollbar-thumb-hover, rgba(0, 0, 0, 0.3));
  }
</style>
