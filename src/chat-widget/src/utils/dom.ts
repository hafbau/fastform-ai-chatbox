export function createElement<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className?: string,
  attributes?: Record<string, string>
): HTMLElementTagNameMap[K] {
  const element = document.createElement(tag)
  if (className) element.className = className
  if (attributes) {
    Object.entries(attributes).forEach(([key, value]) => {
      element.setAttribute(key, value)
    })
  }
  return element
}

export function adjustTextareaHeight(textarea: HTMLTextAreaElement, maxHeight: number = 150) {
  textarea.style.height = 'auto'
  textarea.style.height = `${Math.min(textarea.scrollHeight, maxHeight)}px`
}

export function disableForm(form: HTMLFormElement, disable: boolean = true) {
  const elements = form.querySelectorAll('button, textarea, input')
  elements.forEach(element => {
    if (disable) {
      element.setAttribute('disabled', 'true')
    } else {
      element.removeAttribute('disabled')
    }
  })
}

export function scrollToBottom(element: HTMLElement, smooth: boolean = true) {
  element.scrollTo({
    top: element.scrollHeight,
    behavior: smooth ? 'smooth' : 'auto'
  })
}
