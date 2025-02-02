<script>
  import { onMount, onDestroy } from 'svelte'
  import { marked } from 'marked'
  import DOMPurify from 'dompurify'
  import { TextToSpeechService } from '../services/TextToSpeechService'
  import { fly } from 'svelte/transition'

  export let message
  export let isUser = false

  let ttsService

  $: formattedContent = DOMPurify.sanitize(marked.parse(message.content))
  $: formattedTime = new Date(message.timestamp).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  })

  onMount(async () => {
    if (!isUser) {
      ttsService = new TextToSpeechService()
      await ttsService.speak(message.content)
    }
  })

  onDestroy(() => {
    if (ttsService) {
      ttsService.stop()
    }
  })
</script>

<div 
  class="message {isUser ? 'message--user' : ''}"
  transition:fly={{ y: 20, duration: 300 }}
>
  <div class="message__content">
    {@html formattedContent}
  </div>
  <div class="message__time">
    {formattedTime}
  </div>
</div>

<style>
  .message {
    display: flex;
    flex-direction: column;
    gap: 4px;
    max-width: 80%;
    animation: slide-up 0.2s ease-out;
  }

  .message--user {
    align-self: flex-end;
  }

  .message__content {
    padding: 12px 16px;
    border-radius: 12px;
    background: var(--buildship-chat-message-bg, #f3f4f6);
    color: var(--buildship-chat-text-color, #1f2937);
    font-size: 14px;
    line-height: 1.5;
  }

  .message--user .message__content {
    background: var(--buildship-chat-user-message-bg, #2563eb);
    color: var(--buildship-chat-user-message-color, #ffffff);
  }

  .message__time {
    font-size: 12px;
    color: var(--buildship-chat-time-color, #6b7280);
    align-self: flex-end;
  }

  @keyframes slide-up {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>
