<script>
  import { computePosition } from '@floating-ui/dom'
  
  export let buttonPosition = "bottom-right"
  export let isOpen = false
  export let styles = {}

  let buttonContainer
  let virtualElement
  let resizeCleanup = null

  // Create a virtual element for button positioning
  $: virtualElement = buttonPosition === 'custom' ? null : {
    getBoundingClientRect() {
      const width = buttonContainer?.offsetWidth || 0
      const height = buttonContainer?.offsetHeight || 0
      const windowWidth = window.innerWidth
      const windowHeight = window.innerHeight
      
      const positions = {
        'top-left': { x: 20, y: 20 },
        'top-right': { x: windowWidth - width - 20, y: 20 },
        'bottom-left': { x: 20, y: windowHeight - height - 20 },
        'bottom-right': { x: windowWidth - width - 20, y: windowHeight - height - 20 }
      }
      
      const pos = positions[buttonPosition] || positions['bottom-right']
      
      return {
        width,
        height,
        x: pos.x,
        y: pos.y,
        top: pos.y,
        right: pos.x + width,
        bottom: pos.y + height,
        left: pos.x
      }
    }
  }

  function updatePosition() {
    if (!virtualElement || !buttonContainer) return
    
    const rect = virtualElement.getBoundingClientRect()
    Object.assign(buttonContainer.style, {
      position: 'fixed',
      left: `${rect.x}px`,
      top: `${rect.y}px`,
      ...styles
    })
  }

  export function setupPositioning() {
    if (buttonPosition !== 'custom') {
      updatePosition()
      window.addEventListener('resize', updatePosition)
      resizeCleanup = () => window.removeEventListener('resize', updatePosition)
    }
    return buttonContainer
  }

  export function cleanup() {
    if (resizeCleanup) {
      resizeCleanup()
      resizeCleanup = null
    }
  }
</script>

<button
  bind:this={buttonContainer}
  class="chat-button"
  on:click
  aria-label="Toggle chat"
  aria-expanded={isOpen}
  {...$$restProps}
>
  <slot>Chat</slot>
</button>
