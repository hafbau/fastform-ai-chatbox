<script>
  import { marked } from 'marked'
  import DOMPurify from 'dompurify'

  export let message = ''
  export let isUser = false
  export let timestamp = new Date()

  $: sanitizedHtml = DOMPurify.sanitize(marked.parse(message))
  
  const formatTime = (date) => {
    return new Intl.DateTimeFormat('default', {
      hour: 'numeric',
      minute: 'numeric'
    }).format(date)
  }
</script>

<div class="message" class:message--user={isUser}>
  <div class="message__content">
    <div class="message__bubble">
      {@html sanitizedHtml}
    </div>
    <div class="message__time">
      {formatTime(timestamp)}
    </div>
  </div>
</div>

<style>
  .message {
    display: flex;
    margin: 8px 0;
    animation: messageIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .message--user {
    justify-content: flex-end;
  }

  .message__content {
    max-width: 80%;
    display: flex;
    flex-direction: column;
  }

  .message__bubble {
    padding: 12px 16px;
    border-radius: 16px;
    background: var(--buildship-chat-widget-message-bg, #f0f2f5);
    color: var(--buildship-chat-widget-message-text, #1c1c1c);
    box-shadow: var(--buildship-chat-widget-message-shadow, 0 1px 2px rgba(0, 0, 0, 0.05));
  }

  .message--user .message__bubble {
    background: var(--buildship-chat-widget-user-message-bg, #0066FF);
    color: var(--buildship-chat-widget-user-message-text, #ffffff);
  }

  .message__time {
    font-size: 12px;
    color: var(--buildship-chat-widget-time-color, #6b7280);
    margin-top: 4px;
    opacity: 0.8;
  }

  .message--user .message__time {
    text-align: right;
  }

  @keyframes messageIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* Markdown styles */
  .message__bubble :global(p) {
    margin: 0;
    line-height: 1.5;
  }

  .message__bubble :global(code) {
    background: rgba(0, 0, 0, 0.1);
    padding: 2px 4px;
    border-radius: 4px;
    font-family: var(--buildship-chat-widget-code-font, monospace);
  }

  .message__bubble :global(pre) {
    background: rgba(0, 0, 0, 0.1);
    padding: 12px;
    border-radius: 8px;
    overflow-x: auto;
  }

  .message__bubble :global(a) {
    color: inherit;
    text-decoration: underline;
  }

  .message__bubble :global(ul), 
  .message__bubble :global(ol) {
    margin: 8px 0;
    padding-left: 24px;
  }

  .message__bubble :global(li) {
    margin: 4px 0;
  }
</style>
