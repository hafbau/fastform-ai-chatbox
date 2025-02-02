<script>
  export let isOpen = false
</script>

<div 
  class="chat-backdrop" 
  class:chat-backdrop--active={isOpen} 
  on:click 
  aria-label="Close chat" 
  {...$$restProps}
/>
