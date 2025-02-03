<script>
  export let title = 'Chat'
  export let isCloseButtonVisible = true
  export let onClose = () => {}
</script>

<header class="chat-header">
  <h2 class="chat-title">{title}</h2>
  {#if isCloseButtonVisible}
    <button
      class="close-button" 
      on:click={onClose}
      aria-label="Close chat"
    >
      <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
      </svg>
    </button>
  {/if}
</header>

<style>
  .chat-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px;
    background: var(--buildship-chat-widget-header-bg, #ffffff);
    border-bottom: 1px solid var(--buildship-chat-widget-border-color, rgba(0, 0, 0, 0.1));
  }

  .chat-title {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: var(--buildship-chat-widget-header-text, #1c1c1c);
  }

  .close-button {
    background: transparent;
    border: none;
    padding: 8px;
    cursor: pointer;
    color: var(--buildship-chat-widget-close-color, #6b7280);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .close-button:hover {
    background: var(--buildship-chat-widget-close-hover-bg, rgba(0, 0, 0, 0.05));
    color: var(--buildship-chat-widget-close-hover, #1c1c1c);
  }
</style>
