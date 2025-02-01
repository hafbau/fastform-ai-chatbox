import { marked } from 'marked'

// Configure marked for security and features
marked.setOptions({
  breaks: true,
  gfm: true
})

export function parseMarkdown(content: string): string {
  try {
    const parsed = marked.parse(content)
    return typeof parsed === 'string' ? parsed : content
  } catch (error) {
    console.error('Error parsing markdown:', error)
    return content
  }
}

export function sanitizeHTML(html: string): string {
  // Basic HTML sanitization
  return html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
}
