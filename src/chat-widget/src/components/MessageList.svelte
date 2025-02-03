<script>
  import Message from './Message.svelte'
  import { onMount } from 'svelte'

  export let messages = []
  export let isLoading = false
  export let error = null
  export let isAudioMode = false
  let messageContainer
  let lastMessageElement
  let messageElements = []

  onMount(() => {
    scrollToBottom()
  })

  $: if (messages) {
    // Wait for DOM update
    setTimeout(() => {
      scrollToBottom()
      focusLastMessage()
    }, 0)
  }

  $: if (isLoading) {
    console.log('MessageList isLoading', isLoading)
  }

  function scrollToBottom() {
    if (messageContainer) {
      messageContainer.scrollTop = messageContainer.scrollHeight
    }
  }

  function focusLastMessage() {
    const lastElement = messageElements[messageElements.length - 1]
    if (lastElement) {
      lastElement.setAttribute('tabindex', '0')
      lastElement.focus()
    }
  }

  function handleKeydown(event) {
    if (event.key === 'ArrowUp') {
      event.preventDefault()
      const prevMessage = event.target.previousElementSibling
      if (prevMessage) {
        prevMessage.focus()
      }
    } else if (event.key === 'ArrowDown') {
      event.preventDefault()
      const nextMessage = event.target.nextElementSibling
      if (nextMessage) {
        nextMessage.focus()
      }
    }
  }
</script>

<div 
  class="message-list" 
  bind:this={messageContainer}
  role="log"
  aria-live="polite"
  aria-label="Chat messages"
>
  {#if error}
    <div class="error" role="alert">
      <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
      <span>{error}</span>
    </div>
  {/if}

  {#each messages as message, i (message.id)}
    <div
      bind:this={messageElements[i]}
      on:keydown={handleKeydown}
      style="display: flex; flex-direction: column;"
    >
      <Message
        {message}
        isUser={message.role === 'user'}
        isAudioMode={isAudioMode}
      />
    </div>
  {/each}

  {#if isLoading}
    <div class="loading" aria-live="polite">
      <div class="typing-indicator">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
  {/if}
</div>

<style>
  .message-list {
    flex: 1;
    overflow-y: scroll;
    padding: 16px;
    scroll-behavior: smooth;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  /* Custom scrollbar */
  .message-list::-webkit-scrollbar {
    width: 6px;
  }

  .message-list::-webkit-scrollbar-track {
    background: var(--buildship-chat-scrollbar-track, rgba(0, 0, 0, 0.05));
  }

  .message-list::-webkit-scrollbar-thumb {
    background: var(--buildship-chat-scrollbar-thumb, rgba(0, 0, 0, 0.2));
    border-radius: 3px;
  }

  .message-list::-webkit-scrollbar-thumb:hover {
    background: var(--buildship-chat-scrollbar-thumb-hover, rgba(0, 0, 0, 0.3));
  }

  .error {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px;
    background: var(--buildship-chat-error-bg, #fee2e2);
    color: var(--buildship-chat-error-color, #dc2626);
    border-radius: 8px;
    font-size: 14px;
  }

  .loading {
    align-self: flex-start;
    padding: 12px 16px;
    background: var(--buildship-chat-message-bg, #f0f0f0);
    border-radius: var(--buildship-chat-message-radius, 12px);
  }

  .typing-indicator {
    display: flex;
    gap: 4px;
  }

  .typing-indicator span {
    width: 8px;
    height: 8px;
    background: var(--buildship-chat-typing-color, #9ca3af);
    border-radius: 50%;
    animation: typing 1.4s infinite both;
  }

  .typing-indicator span:nth-child(2) {
    animation-delay: 0.2s;
  }

  .typing-indicator span:nth-child(3) {
    animation-delay: 0.4s;
  }

  @keyframes typing {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-4px);
    }
  }
</style>
