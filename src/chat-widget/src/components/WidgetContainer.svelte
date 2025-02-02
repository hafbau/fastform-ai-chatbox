<script>
  import { computePosition, flip, shift, offset, autoUpdate } from '@floating-ui/dom'
  import { onDestroy } from 'svelte'
  
  export let widgetPosition = "right"
  export let isOpen = false
  export let referenceElement = null
  export let styles = {}

  let widgetContainer
  let cleanup = null

  function updatePosition() {
    if (!referenceElement || !widgetContainer) return

    computePosition(referenceElement, widgetContainer, {
      placement: widgetPosition === 'left' ? 'left-start' : 'right-start',
      middleware: [
        offset(16),
        flip({
          fallbackPlacements: ['top', 'bottom']
        }),
        shift({ padding: 16 })
      ]
    }).then(({ x, y }) => {
      Object.assign(widgetContainer.style, {
        left: `${x}px`,
        top: `${y}px`,
        ...styles
      })
    })
  }

  export function startPositioning() {
    if (referenceElement && widgetContainer) {
      cleanup = autoUpdate(referenceElement, widgetContainer, updatePosition)
    }
  }

  export function stopPositioning() {
    if (cleanup) {
      cleanup()
      cleanup = null
    }
  }

  function setRef(node) {
    widgetContainer = node
    return {
      destroy() {
        widgetContainer = null
      }
    }
  }

  // Expose the DOM node
  export function getContainer() {
    return widgetContainer
  }

  onDestroy(() => {
    stopPositioning()
  })
</script>

<div
  use:setRef
  class="chat-widget--widget"
  class:chat-widget--open={isOpen}
  role="dialog"
  aria-modal={isOpen}
  aria-hidden={!isOpen}
  {...$$restProps}
>
  <slot />
</div>
